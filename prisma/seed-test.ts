import { prisma } from '../src/lib/prisma'

async function main() {
  const firstModule = await prisma.module.findFirst()
  if (!firstModule) {
    console.log("No firstModule found to insert questions. Please run standard seed first.")
    return
  }

  // Clear old questions in this firstModule to avoid duplicate accumulation
  const oldQuestions = await prisma.question.findMany({ where: { moduleId: firstModule.id } })
  await prisma.studentAnswer.deleteMany({
    where: { questionId: { in: oldQuestions.map((q: { id: any }) => q.id) } }
  })

  await prisma.question.deleteMany({
    where: { moduleId: firstModule.id }
  })

  // Add a READ_ALOUD question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'READ_ALOUD',
      instruction: 'Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.',
      content: JSON.stringify({
        text: 'The development of easy-to-use virtual reality tools has the potential to transform education. By allowing students to experience historical events or explore complex scientific concepts in an immersive environment, learning becomes more engaging and memorable.',
        prepTime: 40,
        recordTime: 40
      })
    }
  })

  // Add a DESCRIBE_IMAGE question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'DESCRIBE_IMAGE',
      instruction: 'Look at the graph below. In 25 seconds, please speak into the microphone and describe in detail what the graph is showing. You will have 40 seconds to give your response.',
      content: JSON.stringify({
        // Using a safe public placeholder image since external hotlinking might break
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
        prepTime: 25,
        recordTime: 40
      })
    }
  })

  // Add a REPEAT_SENTENCE question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'REPEAT_SENTENCE',
      instruction: 'You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence only once.',
      content: JSON.stringify({
        // Using a short free sound effect or music as mock audio
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        prepTime: 3,
        recordTime: 15
      })
    }
  })

  // Add a WRITE_ESSAY question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'WRITE_ESSAY',
      instruction: 'You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of standard written English. You should write 200-300 words.',
      content: JSON.stringify({
        text: 'Some people believe that the advent of artificial intelligence will lead to massive job losses, while others argue it will create new opportunities and improve overall productivity. Discuss both views and give your opinion.',
        timeLimit: 1200, // 20 minutes
        minWords: 200,
        maxWords: 300
      })
    }
  })

  // Add a SUMMARIZE_SPOKEN_TEXT question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'SUMMARIZE_SPOKEN_TEXT',
      instruction: 'You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words. You have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.',
      content: JSON.stringify({
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        timeLimit: 600, // 10 minutes
        minWords: 50,
        maxWords: 70
      })
    }
  })

  // Add a MULTIPLE_CHOICE_SINGLE question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'MULTIPLE_CHOICE_SINGLE',
      instruction: 'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
      content: JSON.stringify({
        text: 'The Amazon rainforest, alternatively, the Amazon jungle or Amazonia, is a moist broadleaf tropical rainforest in the Amazon biome that covers most of the Amazon basin of South America. This basin encompasses 7,000,000 km2 (2,700,000 sq mi), of which 5,500,000 km2 (2,100,000 sq mi) are covered by the rainforest. Which of the following statements is true?',
        options: [
          'The Amazon basin is fully covered by the rainforest.',
          'The Amazon rainforest is a dry broadleaf forest.',
          'The Amazon basin is larger than the Amazon rainforest.',
          'The Amazon biome is completely outside South America.'
        ]
      })
    }
  })

  // Add a REORDER_PARAGRAPHS question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'REORDER_PARAGRAPHS',
      instruction: 'The text boxes in the left panel have been placed in a random order. Restore the original order by dragging the text boxes from the left panel to the right panel.',
      content: JSON.stringify({
        paragraphs: [
          'But what happens when that balance is disturbed?',
          'A healthy ecosystem maintains a delicate balance among its varied inhabitants.',
          'The consequences can be catastrophic for the entire food chain.',
          'For instance, the sudden disappearance of a top predator can lead to overpopulation of herbivores.'
        ]
      })
    }
  })

  // Add a FIB_READING_WRITING question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'FIB_READING_WRITING',
      instruction: 'Below is a text with blanks. Click on each blank, a list of choices will appear. Select the appropriate answer choice for each blank.',
      content: JSON.stringify({
        text: 'Learning a new language can be [BLANK_0] and exciting. It opens up new opportunities and [BLANK_1] you to connect with people from different cultures.',
        options: {
          'BLANK_0': ['challenging', 'challenge', 'challenged', 'challenges'],
          'BLANK_1': ['allows', 'allow', 'allowed', 'allowing']
        }
      })
    }
  })

  // Add a FIB_READING (Drag Drop) question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'FIB_READING',
      instruction: 'In the text below some words are missing. Drag words from the box below to the appropriate place in the text. To undo an answer choice, drag the word back to the box below the text.',
      content: JSON.stringify({
        text: 'The global [BLANK_0] is expected to grow steadily over the next decade. This growth will largely be driven by technological [BLANK_1] and increased international trade.',
        words: ['economy', 'advancements', 'decline', 'barriers', 'weather']
      })
    }
  })

  // Add a HIGHLIGHT_INCORRECT_WORDS question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'HIGHLIGHT_INCORRECT_WORDS',
      instruction: 'You will hear a recording. Below is a transcript of the recording. Some words in the transcript differ from what the speaker says. Please click on the words that are different.',
      content: JSON.stringify({
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        timeLimit: 300,
        transcript: 'I think the most important thing is to make sure that the system is completely reliable. If there are any flaws, the entire project could be jeopardized and we might lose our funding.'
      })
    }
  })

  // Add a FIB_LISTENING question
  await prisma.question.create({
    data: {
      moduleId: firstModule.id,
      type: 'FIB_LISTENING',
      instruction: 'You will hear a recording. Type the missing words in each blank.',
      content: JSON.stringify({
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        timeLimit: 300,
        text: 'The concept of [BLANK_0] energy is becoming increasingly vital. Solar and [BLANK_1] power are leading the transition away from fossil fuels.'
      })
    }
  })

  console.log("Test questions seeded into module:", firstModule.title)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
