export default {
  myJob: {
    task: async ({ strapi }) => {
      console.log("🔄 Optimized responses recalculation for all polls...");

      const knex = strapi.db.connection;
      const batchSize = 1000;
      let offset = 0;
      let pollStats = new Map();

      while (true) {
        const responsePollLinks = await knex("responses_poll_lnk")
          .select("poll_id", "response_id")
          .limit(batchSize)
          .offset(offset);

        if (responsePollLinks.length === 0) break;

        const responseIds = responsePollLinks.map((link) => link.response_id);
        const responseOptionLinks = await knex("responses_answer_option_lnk")
          .select("response_id", "answer_option_id")
          .whereIn("response_id", responseIds);

        const responseOptionMap = new Map(
          responseOptionLinks.map((link) => [
            link.response_id,
            link.answer_option_id,
          ]),
        );

        const answerOptionIds = [
          ...new Set(responseOptionLinks.map((link) => link.answer_option_id)),
        ];
        const answerOptions = await knex("answer_options")
          .select("id", "type")
          .whereIn("id", answerOptionIds);

        const answerOptionMap = new Map(
          answerOptions.map((opt) => [opt.id, opt.type]),
        );

        for (const link of responsePollLinks) {
          const pollId = link.poll_id;
          const answerOptionId = responseOptionMap.get(link.response_id);
          const optionType = answerOptionMap.get(answerOptionId);

          if (!pollId || !optionType) continue;

          if (!pollStats.has(pollId)) {
            pollStats.set(pollId, { total: 0, affirmative: 0, negative: 0 });
          }

          const stats = pollStats.get(pollId);
          stats.total += 1;
          if (optionType === "affirmative") stats.affirmative += 1;
          if (optionType === "negative") stats.negative += 1;
        }

        offset += batchSize;
      }

      const updates = [];
      for (const [pollId, stats] of pollStats.entries()) {
        updates.push(
          knex("polls").where("id", pollId).update({
            total_responses: stats.total,
            affirmative_responses: stats.affirmative,
            negative_responses: stats.negative,
          }),
        );
      }

      await Promise.all(updates);

      console.log(`✅ Completed! Updated ${pollStats.size} polls.`);
    },
    options: {
      rule: "0 0 0 * * *", // Every day at midnight
    },
  },
};
