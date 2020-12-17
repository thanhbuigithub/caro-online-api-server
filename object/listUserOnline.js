let list_user_online = [];

module.exports.push = (id, username) => {
  const existingUser = list_user_online.find(
    (user) => user.username === username
  );

  if (existingUser) {
    return;
  }

  list_user_online.push({ id, username });
};

module.exports.remove = (id) => {
  const index = list_user_online.findIndex((user) => user.id === id);

  if (index !== -1) {
    list_user_online.splice(index, 1);
  }
};

module.exports.getAll = () => {
  return list_user_online;
};
