const MAX_CHARS = 200;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";
const textareaEl = document.querySelector(".form__textarea");
const counterEl = document.querySelector(".counter");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEl = document.querySelector(".submit-btn");
const spinnerEl = document.querySelector(".spinner");

const renderFeedbackItem = (feedbackItem) => {
  // new feedabck item HTML
  const feedbackItemHTML = `
    <li class="feedback">
        <button class="upvote">
            <i class="fa-solid fa-caret-up upvote__icon"></i>
            <span class="upvote__count">${feedbackItem.upvoteCount}</span>
        </button>
        <section class="feedback__badge">
            <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
        </section>
        <div class="feedback__content">
            <p class="feedback__company">${feedbackItem.company}</p>
            <p class="feedback__text">${feedbackItem.text}</p>
        </div>
        <p class="feedback__date">${
          feedbackItem.daysAgo === 0 ? "NEW" : `${feedbackItem.daysAgo}d`
        }</p>
    </li>`;
  //insert new feedback item in list and parse it as HTML
  feedbackListEl.insertAdjacentHTML("beforeend", feedbackItemHTML);
};

//* ---------------------------- COUNTER COMPONENT --------------------------- *//

const inputHandler = () => {
  // determine maximum number of characters
  const maxNumChars = MAX_CHARS;

  //determine number of character the user has typed
  const charsTyped = textareaEl.value.length;

  //calculate number of characters left (max-typed)
  const charsLeft = maxNumChars - charsTyped;

  //show number of character left so we need to manipulate the HTML
  counterEl.textContent = charsLeft;
};
textareaEl.addEventListener("input", inputHandler);
//we need to specify 2 things , which event and what we want to do when that event happens

//* ---------------------------- FORM COMPONENT --------------------------- *//
const showVisualIndicator = (validitycheck) => {
  const className = validitycheck === "valid" ? "form--valid" : "form--invalid";

  //show invalid indicator
  formEl.classList.add(className);

  //remove invalid indicator
  setTimeout(() => {
    formEl.classList.remove(className);
  }, 2000); //2 sec= 2000ms
};

const submitHandler = (event) => {
  //prevent default browser action (submitting form data to 'action' address and refreshing page)
  event.preventDefault();

  //get text from textarea
  const text = textareaEl.value;

  //validate text (e.g check if it has hashtag and the text is long enough)
  if (text.includes("#") && text.length >= 10) {
    showVisualIndicator("valid");
  } else {
    showVisualIndicator("invalid");

    //focus textarea
    textareaEl.focus();

    //stop the function execution
    return;
    //function will stop executing , without returning anything
  }

  // We have text, extract other info like company name, badge letter, upvote count(0), days ago.
  const hashtag = text.split(" ").find((word) => word.includes("#")); // word toh string hai but text.split array bana deta hai.
  const company = hashtag.substring(1); //cutoff the first character
  const badgeLetter = company.substring(0, 1).toUpperCase();
  const upvoteCount = 0;
  const daysAgo = 0;

  //create and render feedback object
  const feedbackItem = {
    text: text,
    company: company,
    badgeLetter: badgeLetter,
    upvoteCount: upvoteCount,
    daysAgo: daysAgo,
  };
  renderFeedbackItem(feedbackItem);

  // send feebdack item to server
  fetch(`${BASE_API_URL}/feedbacks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(feedbackItem), //converting normal javascript object to JSON format and JSON is basically string
  })
    .then((response) => {
      if (!response.ok) {
        //handle error
        console.log("Something went wrong mate");
        return; //to stop the function execution
      }

      console.log("successfully added");
    })
    .catch((error) => console.log(error));

  //clear textarea
  textareaEl.value = "";

  //blur submit button
  submitBtnEl.blur();

  //reset the counter
  counterEl.textContent = MAX_CHARS;
};

formEl.addEventListener("submit", submitHandler);

//when we use fetch it gives us a promise that in the future we will get a result , once we get the result .then
fetch(`${BASE_API_URL}/feedbacks`)
  .then((response) => {
    return response.json();
    //waiting that all the data is returned, as it comes bit by bit, that get parsed as JSON meaning converted to JAvascript
    //we also want to return the promise then we can use another .then
    //here we don't have access to complete response data yet , so here we get a promis as well that in future we will get our data
  })
  .then((data) => {
    //all of the data has been downloaded and parsed into JS
    //we can only place .then with a promise
    console.log(data.feedbacks);

    //remove the spinner now
    spinnerEl.remove();

    //iterate over each element in feedback array and render it in list
    data.feedbacks.forEach((feedbackItem) => renderFeedbackItem(feedbackItem));
  })
  .catch((error) => {
    feedbackListEl.textContent = `Failed to fetch feedback items. Error message: ${error.message}`;
  });
