import $ from 'jquery';
import daterangepicker from 'daterangepicker';
import moment from 'moment';
import '@fortawesome/fontawesome-free-webfonts';
import '@fortawesome/fontawesome-free-webfonts/css/fa-solid.css';

const apiKey = 'Your API Key';
let query = '';
let beginDate = new Date().toJSON().slice(0, 10).replace(/-/g, '');
let endDate = new Date().toJSON().slice(0, 10).replace(/-/g, '');

// Getting data from NYTimes API
const urlNYT = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';

const main = document.querySelector('main');

async function getData() {
  const response = await fetch(
    `${urlNYT}?q=${query}&begin_date=${beginDate}&end_date=${endDate}&api-key=${apiKey}`,
    {
      headers: {
        Accept: 'application/json',
      },
    }
  );

  const data = await response.json();
  const articles = data.response.docs;
  console.log(articles);

  if (articles) {
    spinnerStop();
  }
  if (articles.length === 0) {
    changeSearchDateInfo();
  }

  articles.forEach((article) => {
    const articleHtml = `
    <article>
    <img src='${
      article.multimedia.length > 0
        ? 'https://static01.nyt.com/' + article.multimedia[0].url
        : ''
    }
    ' >
      <h1>${article.headline.main}</h1>
      <h4>${article.byline.original}</h2>
      <h6>${article.pub_date.slice(0, 10)}</6>
      <p>${article.lead_paragraph}</p>
      <a href=${article.web_url} target="_blank">Read article</a>
    </article>
    `;
    main.insertAdjacentHTML('afterbegin', articleHtml);
  });

  const articleImg = [...document.querySelectorAll('article img')];
}

// Date Range Picker

$(function () {
  let start = moment().subtract(0, 'days');
  let end = moment();

  function cb(start, end) {
    $('#reportrange span').html(
      start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY')
    );
  }

  $('#reportrange').daterangepicker(
    {
      startDate: start,
      endDate: end,
      ranges: {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [
          moment().subtract(1, 'month').startOf('month'),
          moment().subtract(1, 'month').endOf('month'),
        ],
      },
    },
    cb
  );

  cb(start, end);
});

// Updating search result - Search
const inputSearch = document.querySelector('input[name="search"]');
inputSearch.addEventListener('keyup', (e) => {
  e.preventDefault();
  if (e.key === 'Enter') {
    query = e.target.value;

    clearOutput();
    spinnerStart();
    getData();
  }
});

// Updating search result - Search button
const searchBtn = document.querySelector('.search');
searchBtn.addEventListener('click', () => {
  query = inputSearch.value;

  clearOutput();
  spinnerStart();
  getData();
});

// Updating search - Date Range Picker
function updateSearching() {
  $('#reportrange').on('apply.daterangepicker', function (ev, picker) {
    beginDate = picker.startDate.format('YYYY-MM-DD');
    endDate = picker.endDate.format('YYYY-MM-DD');
    if (inputSearch.value) {
      query = inputSearch.value;
      clearOutput();
      spinnerStart();
      getData();
    }
  });
}
updateSearching();
// Cleaning search result

function clearOutput() {
  main.innerHTML = '';
}

// Spinner
const spinner = document.querySelector('.lds-ripple');
function spinnerStart() {
  spinner.classList.add('active');
}

function spinnerStop() {
  spinner.classList.remove('active');
}

function changeSearchDateInfo() {
  const htmlSearchInfo = `
  <h4 class="searchInfo">
  No results. Please change the date range.</4>
  `;
  main.insertAdjacentHTML('afterbegin', htmlSearchInfo);
}
