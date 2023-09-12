export const cleanExams = (examsArray) => (
  examsArray.map(
    exam => {
      if (exam.shuffle) { exam.questions = _.shuffle(exam.questions) }
      exam.shuffle = undefined

      exam.questions = exam.questions.map(
        question => {
          if (question.shuffle) { question.answers = _.shuffle(question.answers) }
          question.shuffle = undefined
          question.correct = undefined
          return question
        }
      )
      return exam
    }
  )
)
