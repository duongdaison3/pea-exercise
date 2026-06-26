const fs = require('fs');
let code = fs.readFileSync('src/components/forms/question-card.tsx', 'utf8');

code = code.replace(/export function QuestionCard\(\{ index, remove, move, form, isFirst, isLast \}\) \{/, 'export function QuestionCard({ sectionIndex, questionIndex, remove, move, form, isFirst, isLast, sectionsCount }: any) {\n  const questionPath = `sections.${sectionIndex}.questions.${questionIndex}`;');

code = code.replace(/questions\.\$\{index\}/g, '${questionPath}');

code = code.replace(/function FIBBuilder\(\{ index, form \}: \{ index: number, form: UseFormReturn<any> \}\) \{/g, 'function FIBBuilder({ questionPath, form }: { questionPath: string, form: UseFormReturn<any> }) {');

code = code.replace(/function HighlightIncorrectBuilder\(\{ index, form \}: \{ index: number, form: UseFormReturn<any> \}\) \{/g, 'function HighlightIncorrectBuilder({ questionPath, form }: { questionPath: string, form: UseFormReturn<any> }) {');

code = code.replace(/function ReorderParagraphsBuilder\(\{ index, form \}: \{ index: number, form: UseFormReturn<any> \}\) \{/g, 'function ReorderParagraphsBuilder({ questionPath, form }: { questionPath: string, form: UseFormReturn<any> }) {');

code = code.replace(/FIBBuilder index=\{index\}/g, 'FIBBuilder questionPath={questionPath}');
code = code.replace(/HighlightIncorrectBuilder index=\{index\}/g, 'HighlightIncorrectBuilder questionPath={questionPath}');
code = code.replace(/ReorderParagraphsBuilder index=\{index\}/g, 'ReorderParagraphsBuilder questionPath={questionPath}');

code = code.replace(/onClick=\{\(\) => remove\(index\)\}/g, 'onClick={() => remove(questionIndex)}');
code = code.replace(/move\(index, index - 1\)/g, 'move(questionIndex, questionIndex - 1)');
code = code.replace(/move\(index, index \+ 1\)/g, 'move(questionIndex, questionIndex + 1)');

code = code.replace(/<div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative">/, `<div className="bg-slate-50 border border-slate-200 rounded-xl p-6 relative">
      <div className="absolute top-4 left-4 flex space-x-2 items-center">
        <span className="text-sm text-slate-500 font-medium">Câu {questionIndex + 1}</span>
        {sectionsCount > 1 && (
          <Select
            value={sectionIndex.toString()}
            onValueChange={(val) => {
              const targetSection = parseInt(val);
              if (targetSection !== sectionIndex) {
                const currentQuestion = form.getValues(questionPath);
                remove(questionIndex);
                const targetQuestions = form.getValues(\`sections.\${targetSection}.questions\`) || [];
                form.setValue(\`sections.\${targetSection}.questions\`, [...targetQuestions, currentQuestion]);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs w-auto border-dashed">
              <SelectValue placeholder="Chuyển phần..." />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: sectionsCount }).map((_, i) => (
                <SelectItem key={i} value={i.toString()}>Phần {i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>`);

fs.writeFileSync('src/components/forms/question-card.tsx', code);
console.log('Fixed question-card.tsx');
