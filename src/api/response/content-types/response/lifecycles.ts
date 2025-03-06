// @ts-nocheck

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    if (!result.publishedAt) {
      return;
    }

    try {
      const fullResponse = await strapi
        .documents("api::response.response")
        .findOne({
          documentId: result.documentId,
          populate: ["poll", "answerOption"],
        });

      const poll = fullResponse.poll;
      const answerOption = fullResponse.answerOption;

      if (!poll || !answerOption) {
        console.warn("Poll or AnswerOption is missing in response:", result.id);
        return;
      }

      const isAffirmative = answerOption.type === "affirmative";
      const isNegative = answerOption.type === "negative";

      await strapi.documents("api::poll.poll").update({
        documentId: poll.documentId,
        data: {
          totalResponses: poll.totalResponses + 1,
          affirmativeResponses:
            poll.affirmativeResponses + (isAffirmative ? 1 : 0),
          negativeResponses: poll.negativeResponses + (isNegative ? 1 : 0),
        },
      });

      await strapi.documents("api::poll.poll").publish({
        documentId: poll.documentId,
      });
    } catch (error) {
      console.error("Error while loading full response", error);
    }
  },
};
