import { createStore, action, Action, persist } from "easy-peasy";

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface UserModel {
  user: User | null;
  setUser: Action<UserModel, User>;
  clearUser: Action<UserModel, void>;
}

const userModel: UserModel = {
  user: null,
  setUser: action((state, payload) => {
    state.user = payload;
  }),
  clearUser: action((state) => {
    state.user = null;
  }),
};

const store = createStore(
  persist(
    {
      user: userModel,
    },
    {
      storage: "localStorage",
      allow: ["user"], // Only persist the user model
    }
  )
);

export default store;
export type StoreModel = typeof store;
