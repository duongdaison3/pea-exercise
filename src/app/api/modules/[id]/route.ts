import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie) as { userId: string } | null;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !['ADMIN', 'TEACHER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { sections, ...moduleData } = data;

    // Calculate scores before updating Module
    let finalTotalScore = moduleData.totalScore || 100;
    let totalQuestionsCount = 0;

    if (sections && sections.length > 0) {
      for (const sec of sections) {
        if (sec.questions) {
          totalQuestionsCount += sec.questions.length;
        }
      }
    }

    if (moduleData.scoringMode === 'PER_QUESTION') {
      finalTotalScore = 0;
      if (sections && sections.length > 0) {
        for (const sec of sections) {
          if (sec.questions) {
            sec.questions.forEach((q: any) => {
              finalTotalScore += Number(q.score) || 0;
            });
          }
        }
      }
    }

    const pointPerQuestion = totalQuestionsCount > 0 && moduleData.scoringMode === 'TOTAL_DIVIDED'
      ? Math.floor((finalTotalScore / totalQuestionsCount) * 100) / 100
      : 0;

    // Smart Upsert logic
    await prisma.$transaction(async (tx: any) => {
      // 1. Update basic module info
      await tx.module.update({
        where: { id },
        data: {
          ...moduleData,
          totalScore: finalTotalScore
        }
      });

      // Fetch existing sections and questions
      const existingSections = await tx.section.findMany({
        where: { moduleId: id },
        include: { questions: true }
      });

      const existingSectionIds = new Set(existingSections.map((s: any) => s.id));
      const existingQuestionIds = new Set(existingSections.flatMap((s: any) => s.questions.map((q: any) => q.id)));

      // Sets to track what is kept
      const keptSectionIds = new Set<string>();
      const keptQuestionIds = new Set<string>();

      if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          let currentSectionId = sec.id;

          // Upsert section
          if (currentSectionId && existingSectionIds.has(currentSectionId)) {
            await tx.section.update({
              where: { id: currentSectionId },
              data: {
                title: sec.title,
                timeLimit: sec.timeLimit || 0,
                orderIndex: i
              }
            });
            keptSectionIds.add(currentSectionId);
          } else {
            const newSection = await tx.section.create({
              data: {
                moduleId: id,
                title: sec.title,
                timeLimit: sec.timeLimit || 0,
                orderIndex: i
              }
            });
            currentSectionId = newSection.id;
          }

          // Upsert questions
          if (sec.questions && sec.questions.length > 0) {
            for (const q of sec.questions) {
              const qScore = moduleData.scoringMode === 'TOTAL_DIVIDED' ? pointPerQuestion : (Number(q.score) || 0);

              if (q.id && existingQuestionIds.has(q.id)) {
                await tx.question.update({
                  where: { id: q.id },
                  data: {
                    sectionId: currentSectionId,
                    type: q.type,
                    instruction: q.instruction,
                    content: q.content,
                    score: qScore
                  }
                });
                keptQuestionIds.add(q.id);
              } else {
                await tx.question.create({
                  data: {
                    moduleId: id,
                    sectionId: currentSectionId,
                    type: q.type,
                    instruction: q.instruction,
                    content: q.content,
                    score: qScore
                  }
                });
              }
            }
          }
        }
      }

      // Delete removed questions
      const questionsToDelete = Array.from(existingQuestionIds).filter((qid: any) => !keptQuestionIds.has(qid));
      if (questionsToDelete.length > 0) {
        // Check if any has StudentAnswer
        const hasAnswers = await tx.studentAnswer.findFirst({
          where: { questionId: { in: questionsToDelete } }
        });
        if (hasAnswers) {
          throw new Error('Không thể xóa câu hỏi đã có học sinh làm bài.');
        }
        await tx.question.deleteMany({
          where: { id: { in: questionsToDelete } }
        });
      }

      // Delete removed sections
      const sectionsToDelete = Array.from(existingSectionIds).filter((sid: any) => !keptSectionIds.has(sid));
      if (sectionsToDelete.length > 0) {
        await tx.section.deleteMany({
          where: { id: { in: sectionsToDelete } }
        });
      }
    }, {
      maxWait: 5000,
      timeout: 20000,
    });

    return NextResponse.json({ success: true, moduleId: id });
  } catch (error: any) {
    console.error('Module update error:', error);
    if (error.message === 'Không thể xóa câu hỏi đã có học sinh làm bài.') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
