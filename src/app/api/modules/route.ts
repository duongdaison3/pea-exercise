import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookie = (await cookies()).get('session')?.value;
    const session = await decrypt(cookie) as { userId: string } | null;
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !['ADMIN', 'TEACHER'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();

    const { sections, ...moduleData } = data;

    // Calculate scores before creating Module
    let finalTotalScore = moduleData.totalScore || 100;
    let totalQuestionsCount = 0;

    if (sections && sections.length > 0) {
      for (const sec of sections) {
        if (sec.questions) {
          totalQuestionsCount += sec.questions.length;
          if (moduleData.scoringMode === 'PER_QUESTION') {
            // Recalculate totalScore by summing up individual question scores
            sec.questions.forEach((q: any) => {
              finalTotalScore += Number(q.score) || 0;
            });
          }
        }
      }
    }

    if (moduleData.scoringMode === 'PER_QUESTION') {
      // If PER_QUESTION, the initial moduleData.totalScore from client is ignored, we overwrite it.
      // Wait, we need to reset it to 0 before summing.
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

    const result = await prisma.$transaction(async (tx: { module: { create: (arg0: { data: any; }) => any; }; section: { create: (arg0: { data: { moduleId: any; title: any; timeLimit: any; orderIndex: number; }; }) => any; }; question: { createMany: (arg0: { data: any; }) => any; }; }) => {
      const newModule = await tx.module.create({
        data: {
          ...moduleData,
          totalScore: finalTotalScore,
          orderIndex: 0
        }
      });

      if (sections && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          const newSection = await tx.section.create({
            data: {
              moduleId: newModule.id,
              title: sec.title,
              timeLimit: sec.timeLimit || 0,
              orderIndex: i
            }
          });

          if (sec.questions && sec.questions.length > 0) {
            const questionsToCreate = sec.questions.map((q: any) => ({
              moduleId: newModule.id,
              sectionId: newSection.id,
              type: q.type,
              instruction: q.instruction,
              content: q.content,
              score: moduleData.scoringMode === 'TOTAL_DIVIDED' ? pointPerQuestion : (Number(q.score) || 0)
            }));

            await tx.question.createMany({
              data: questionsToCreate
            });
          }
        }
      }

      return newModule;
    }, {
      maxWait: 5000,
      timeout: 20000,
    });

    return NextResponse.json({ success: true, moduleId: result.id });
  } catch (error) {
    console.error('Module creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
