import { v4 as uuidv4 } from "uuid";

export default {
  async beforeCreate(event) {
    const { data } = event.params;

    if (!data.uuid) {
      data.uuid = uuidv4();
    }
  },
};
