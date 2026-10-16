// Firebase Web configuration is public. GitHub App secrets stay in Firebase, never here.
export const firebaseConfig = {
  apiKey: "AIzaSyBc0ECxXQNZBgDvGjNf_EEURZs8GJfcj2o",
  authDomain: "ztgeng-online-gomoku.firebaseapp.com",
  projectId: "ztgeng-online-gomoku",
  storageBucket: "ztgeng-online-gomoku.firebasestorage.app",
  messagingSenderId: "456045351370",
  appId: "1:456045351370:web:0399c61369b627de753f33",
  measurementId: "G-MEMDGVJG8E"
};

export const discussionConfig = {
  owner: "ZTGeng",
  name: "ZTGeng.github.io",
  number: 5
};

export const gameConfig = {
  discussionId: "D_kwDOAcIoFc4AqDm4",
  adminIds: ["MDQ6VXNlcjY1OTEyNTc="],
  pollMs: 5000,
  pageSize: 12,
  retentionDays: 30
};

export const messageConfig = {
  owner: "ZTGeng", name: "ZTGeng.github.io", number: 6,
  pageSize: 20, maxLength: 1000
};
