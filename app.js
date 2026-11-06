const POSTS_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5";
const CREATE_URL = "https://jsonplaceholder.typicode.com/posts";
const USER_ID = 1;

const loadButton = document.getElementById("load-button");
const postList = document.getElementById("post-list");
const emptyHint = document.getElementById("post-empty");
const form = document.getElementById("post-form");
const titleInput = document.getElementById("post-title");
const bodyInput = document.getElementById("post-body");
const titleError = document.getElementById("post-title-error");
const bodyError = document.getElementById("post-body-error");
const submitButton = document.getElementById("submit-button");
const messages = document.getElementById("messages");

const showMessage = (text, type) => {
  messages.textContent = text;
  messages.className = `message ${type}`;
  messages.hidden = false;
};

const setBusy = (button, busy) => {
  button.disabled = busy;
  button.setAttribute("aria-busy", String(busy));
};

const createPostItem = (post) => {
  const item = document.createElement("li");
  item.className = "post";

  const id = document.createElement("span");
  id.className = "post-id";
  id.textContent = `ID ${post.id}`;

  const title = document.createElement("h3");
  title.textContent = post.title;

  const body = document.createElement("p");
  body.textContent = post.body;

  item.append(id, title, body);
  return item;
};

const renderPosts = (posts) => {
  postList.replaceChildren(...posts.map(createPostItem));
  emptyHint.hidden = posts.length > 0;
};

const createError = (code) => {
  const error = new Error(String(code));
  error.code = code;
  return error;
};

const fetchJson = async (url, options) => {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw createError("NETWORK_ERROR");
  }

  if (!response.ok) {
    throw createError(response.status);
  }

  try {
    const data = await response.json();
    return { status: response.status, data };
  } catch {
    throw createError("PARSE_ERROR");
  }
};

const loadPosts = async () => {
  setBusy(loadButton, true);
  showMessage("Загружаем публикации...", "info");

  try {
    const { status, data: posts } = await fetchJson(POSTS_URL);
    renderPosts(posts);
    showMessage(`Код ответа: ${status}. Загружено публикаций: ${posts.length}.`, "success");
  } catch (error) {
    showMessage(`Код ошибки: ${error.code}`, "error");
  } finally {
    setBusy(loadButton, false);
  }
};

const validatePost = (title, body) => {
  const errors = {};

  if (title === "") {
    errors.title = "EMPTY_TITLE";
  }

  if (body === "") {
    errors.body = "EMPTY_BODY";
  }

  return errors;
};

const showFieldErrors = (errors) => {
  titleError.textContent = errors.title ? `Код ошибки: ${errors.title}` : "";
  bodyError.textContent = errors.body ? `Код ошибки: ${errors.body}` : "";
  titleInput.classList.toggle("invalid", Boolean(errors.title));
  bodyInput.classList.toggle("invalid", Boolean(errors.body));
};

const createPost = async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  const errors = validatePost(title, body);
  showFieldErrors(errors);

  if (Object.keys(errors).length > 0) {
    showMessage("Код ошибки: FORM_INVALID", "error");
    return;
  }

  setBusy(submitButton, true);
  showMessage("Отправляем публикацию...", "info");

  try {
    const { status, data: created } = await fetchJson(CREATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: USER_ID }),
    });

    postList.prepend(createPostItem(created));
    emptyHint.hidden = true;
    form.reset();
    showFieldErrors({});
    showMessage(`Код ответа: ${status}. Публикация создана. ID: ${created.id}, заголовок: «${created.title}».`, "success");
  } catch (error) {
    showMessage(`Код ошибки: ${error.code}`, "error");
  } finally {
    setBusy(submitButton, false);
  }
};

loadButton.addEventListener("click", loadPosts);
form.addEventListener("submit", createPost);