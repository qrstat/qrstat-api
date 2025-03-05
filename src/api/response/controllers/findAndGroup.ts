export const findAndGroupWeek = async (id) => {
  const results = await strapi.db
    .connection("responses")
    .join(
      "responses_poll_lnk",
      "responses_poll_lnk.response_id",
      "responses.id",
    )
    .leftJoin(
      "responses_answer_option_lnk",
      "responses_answer_option_lnk.response_id",
      "responses.id",
    )
    .leftJoin(
      "answer_options",
      "responses_answer_option_lnk.answer_option_id",
      "answer_options.id",
    )
    .where("responses_poll_lnk.poll_id", id)
    .where(
      "responses.created_at",
      ">=",
      strapi.db.connection.raw("NOW() - INTERVAL '6 days'"),
    )
    .select(
      strapi.db.connection.raw(
        "TO_CHAR(responses.created_at, 'DD.MM.YYYY') AS response_date",
      ),
      strapi.db.connection.raw(
        "CAST(COUNT(*) FILTER (WHERE answer_options.type = 'affirmative') AS INTEGER) AS affirmative",
      ),
      strapi.db.connection.raw(
        "CAST(COUNT(*) FILTER (WHERE answer_options.type = 'negative') AS INTEGER) AS negative",
      ),
    )
    .groupBy(
      strapi.db.connection.raw("TO_CHAR(responses.created_at, 'DD.MM.YYYY')"),
    )
    .orderByRaw(
      "TO_DATE(TO_CHAR(responses.created_at, 'DD.MM.YYYY'), 'DD.MM.YYYY')",
    );

  return results;
};

export const findAndGroupMonth = async (id) => {
  const results = await strapi.db
    .connection("responses")
    .join(
      "responses_poll_lnk",
      "responses_poll_lnk.response_id",
      "responses.id",
    )
    .leftJoin(
      "responses_answer_option_lnk",
      "responses_answer_option_lnk.response_id",
      "responses.id",
    )
    .leftJoin(
      "answer_options",
      "responses_answer_option_lnk.answer_option_id",
      "answer_options.id",
    )
    .where("responses_poll_lnk.poll_id", id)
    .where(
      "responses.created_at",
      ">=",
      strapi.db.connection.raw("NOW() - INTERVAL '1 month'"),
    )
    .select(
      strapi.db.connection.raw(
        "TO_CHAR(responses.created_at, 'DD.MM.YYYY') AS response_date",
      ),
      strapi.db.connection.raw(
        "CAST(COUNT(*) FILTER (WHERE answer_options.type = 'affirmative') AS INTEGER) AS affirmative",
      ),
      strapi.db.connection.raw(
        "CAST(COUNT(*) FILTER (WHERE answer_options.type = 'negative') AS INTEGER) AS negative",
      ),
    )
    .groupBy(
      strapi.db.connection.raw("TO_CHAR(responses.created_at, 'DD.MM.YYYY')"),
    )
    .orderByRaw(
      "TO_DATE(TO_CHAR(responses.created_at, 'DD.MM.YYYY'), 'DD.MM.YYYY')",
    );

  return results;
};

export const fillMissingDates = (data: any[], daysBack = 7) => {
  const allDates: {
    response_date: string;
    affirmative: number;
    negative: number;
  }[] = [];

  for (let i = daysBack; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const formattedDate = date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const existingEntry = data.find(
      (entry) => entry.response_date === formattedDate,
    );

    if (existingEntry) {
      allDates.push(existingEntry);
    } else {
      allDates.push({
        response_date: formattedDate,
        affirmative: 0,
        negative: 0,
      });
    }
  }

  return allDates;
};
export const findAndGroupYear = async (id) => {
  if (!id) {
    throw new Error("Missing required parameter: id");
  }

  const results = await strapi.db
    .connection("responses")
    .join(
      "responses_poll_lnk",
      "responses_poll_lnk.response_id",
      "responses.id",
    )
    .leftJoin(
      "responses_answer_option_lnk",
      "responses_answer_option_lnk.response_id",
      "responses.id",
    )
    .leftJoin(
      "answer_options",
      "responses_answer_option_lnk.answer_option_id",
      "answer_options.id",
    )
    .where("responses_poll_lnk.poll_id", id)
    .where(
      "responses.created_at",
      ">=",
      strapi.db.connection.raw("NOW() - INTERVAL '12 months'"),
    )
    .select(
      strapi.db.connection.raw(
        "TO_CHAR(responses.created_at, 'MM-YYYY') AS response_month",
      ),
      strapi.db.connection.raw(
        "CAST(COUNT(*) FILTER (WHERE answer_options.type = 'affirmative') AS INTEGER) AS affirmative",
      ),
      strapi.db.connection.raw(
        "CAST(COUNT(*) FILTER (WHERE answer_options.type = 'negative') AS INTEGER) AS negative",
      ),
    )
    .groupBy(
      strapi.db.connection.raw("TO_CHAR(responses.created_at, 'MM-YYYY')"),
    )
    .orderByRaw("TO_DATE(TO_CHAR(responses.created_at, 'MM-YYYY'), 'MM-YYYY')");

  const today = new Date();
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return `${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`; // 📌 MM-YYYY
  }).reverse();

  const formattedResults = allMonths.map((date) => {
    const existingEntry = results.find(
      (entry) => entry.response_month === date,
    );

    const formattedDate = `01.${date.replace("-", ".")}`;

    return existingEntry
      ? {
          response_date: formattedDate,
          affirmative: existingEntry.affirmative,
          negative: existingEntry.negative,
        }
      : { response_date: formattedDate, affirmative: 0, negative: 0 };
  });

  return formattedResults;
};

export const findAndGroupAllTime = async (id) => {
  if (!id) {
    throw new Error("Missing required parameter: id");
  }

  const results = await strapi.db
    .connection("responses")
    .join(
      "responses_poll_lnk",
      "responses_poll_lnk.response_id",
      "responses.id",
    )
    .leftJoin(
      "responses_answer_option_lnk",
      "responses_answer_option_lnk.response_id",
      "responses.id",
    )
    .leftJoin(
      "answer_options",
      "responses_answer_option_lnk.answer_option_id",
      "answer_options.id",
    )
    .where("responses_poll_lnk.poll_id", id)
    .select(
      strapi.db.connection.raw(
        "TO_CHAR(responses.created_at, 'MM-YYYY') AS month",
      ),
      strapi.db.connection.raw(
        "CAST(COUNT(*) FILTER (WHERE answer_options.type = 'affirmative') AS INTEGER) AS affirmative",
      ),
      strapi.db.connection.raw(
        "CAST(COUNT(*) FILTER (WHERE answer_options.type = 'negative') AS INTEGER) AS negative",
      ),
    )
    .groupBy(
      strapi.db.connection.raw("TO_CHAR(responses.created_at, 'MM-YYYY')"),
    )
    .orderByRaw("TO_DATE(TO_CHAR(responses.created_at, 'MM-YYYY'), 'MM-YYYY')");

  const today = new Date();
  const twelveMonthsAgo = new Date(
    today.getFullYear(),
    today.getMonth() - 11,
    1,
  );

  let firstDate;
  if (results.length > 0) {
    const firstResultDate = new Date(
      results[0].month.split("-")[1],
      results[0].month.split("-")[0] - 1,
    );
    firstDate =
      firstResultDate < twelveMonthsAgo ? firstResultDate : twelveMonthsAgo;
  } else {
    firstDate = twelveMonthsAgo;
  }

  const lastDate = today;
  const allMonths = [];
  let currentDate = new Date(firstDate);

  while (currentDate <= lastDate) {
    const formattedMonth = `${String(currentDate.getMonth() + 1).padStart(2, "0")}-${currentDate.getFullYear()}`;

    allMonths.push(formattedMonth);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  const formattedResults = allMonths.map((month) => {
    const existingEntry = results.find((entry) => entry.month === month);
    const formattedDate = `01.${month.replace("-", ".")}`;
    return existingEntry
      ? {
          response_date: formattedDate,
          affirmative: existingEntry.affirmative,
          negative: existingEntry.negative,
        }
      : { formattedDate, affirmative: 0, negative: 0 };
  });

  return formattedResults;
};
