var jsons = ["/data/source1.json", "/data/source2.json"];

var videos = [];

window.onload = function() {
  videos = [];
};

initalRequest(jsons[0]);

function initalRequest(source) {
  getData(source, function(response) {
    videos = JSON.parse(response);
  });
  nextRequest(jsons[1]);
}

function nextRequest(source) {
  getData(source, function(response) {
    var newContent = JSON.parse(response);
    var currentList = document.getElementById("videos-list");
    newContent.forEach(function(item) {
      var listItem = buildItem(item);
      currentList.appendChild(listItem);
      videos.push(item);
    });
    var order = document.querySelector('input[name="order"]:checked').value;
    orderBy(order, videos);
  });
}

//Get data from json
function getData(source, callback) {
  var request = new XMLHttpRequest();
  request.overrideMimeType("application/json");
  request.open("GET", source, true);
  request.onreadystatechange = function() {
    if (request.status == "200" && request.readyState == 4) {
      callback(request.responseText);
    }
  };
  request.send(null);
}

//card skeleton
function buildCard(item) {
  var card = document.createElement("div");
  card.classList.add("card");

  var cardImage = document.createElement("div");
  cardImage.classList.add("card-image");
  cardImage.classList.add("card-image-background");

  var image = document.createElement("img");
  image.classList.add("card-image");
  image.src = item.thumbnail_url;

  var cardTitle = document.createElement("div");
  cardTitle.classList.add("card-title");
  cardTitle.classList.add("searchable");
  cardTitle.innerHTML = item.title;

  var cardFooter = document.createElement("div");
  cardFooter.classList.add("card-footer");

  card.appendChild(cardTitle);
  card.appendChild(cardImage);
  card.appendChild(cardFooter);

  var rating = document.createElement("span");
  rating.classList.add("rating");
  rating.classList.add("searchable");

  var thumbUp = document.createElement("i");
  thumbUp.classList.add("fas");
  thumbUp.classList.add("fa-thumbs-up");

  var ratingText = item.rating || "xxxx";

  rating.innerText = ratingText;
  rating.appendChild(thumbUp);

  var date = document.createElement("span");
  date.innerText = fomateDate(item.posttime);

  cardImage.appendChild(rating);
  cardFooter.appendChild(buildTags(item));
  cardFooter.appendChild(date);

  image.onload = function() {
    cardImage.appendChild(image);
    cardImage.classList.remove('card-image-background');
  };

  return card;
}

//Create list item
function buildItem(item) {
  var listItem = document.createElement("li");
  listItem.classList.add("cards-item");
  listItem.appendChild(buildCard(item));
  return listItem;
}

function buildTags(item) {
  var taglist = document.createElement("ul");
  taglist.classList.add("tags-list");
  item.tags.forEach(function(element) {
    var tag = document.createElement("li");
    tag.classList.add("tag");
    tag.classList.add("searchable");
    tag.innerHTML = element;

    taglist.appendChild(tag);
  });
  return taglist;
}

function buildList() {
  var listElement = document.getElementById("videos-list");

  //clear list
  //   while (listElement.firstChild) {
  //     listElement.removeChild(listElement.firstChild);
  //   }
  listElement.innerHTML = "";

  videos.forEach(function(item) {
    var listItem = buildItem(item);
    listElement.appendChild(listItem);
  });
}

//change list order
var orderSelectionHandler = (function initChangeHandler() {
  var lastSelected = null;

  var result = function(event) {
    var currentSelected = event.target;
    var name = currentSelected.name;

    if (name !== "order") return;

    orderBy(currentSelected.value, videos);

    lastSelected = currentSelected;
  };

  return result;
})();

// listeners
document.addEventListener("change", orderSelectionHandler, false);
var searchInput = document.querySelector('#search-input');
searchInput.addEventListener("keyup", search);


//order
function orderBy(ordening, array) {
  switch (ordening) {
    case "order-newest":
      array.sort(function(a, b) {
        var aDate = new Date(a.posttime);
        var bDate = new Date(b.posttime);

        return bDate.getTime() - aDate.getTime();
      });
      break;
    case "order-oldest":
      array.sort(function(a, b) {
        var aDate = new Date(a.posttime);
        var bDate = new Date(b.posttime);

        return aDate.getTime() - bDate.getTime();
      });
      break;
    case "order-rating":
      array.sort(function(a, b) {
        if (isNaN(a.rating)) {
          a.rating = 0;
        }
        if (isNaN(b.rating)) {
          b.rating = 0;
        }
        return a.rating < b.rating;
      });
      break;
    default:
      null;
  }
  buildList();
}

//formate date
function fomateDate(dateString) {
  var date = new Date(dateString);
  var formated =
    date.getDate() +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    date.getFullYear() +
    " " +
    date.getHours() +
    ":" +
    date.getMinutes();
  return formated;
}

//Search in all elements inside the card
function search() {
  var searchInput = document.querySelector("#search-input");
  var filter = searchInput.value.toUpperCase();
  var list = document.querySelectorAll(".cards-item");

  var alldescendants = [];

  list.forEach(function(item) {
    //console.log(item.classList);
    var itemChild = item.childNodes;
    // console.log(itemChild);
    if (itemChild.nodeType == 1) {
      recurseAndAdd(itemChild, alldescendants);
    }
    if (item.innerText.toLocaleUpperCase().indexOf(filter) > -1) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
  //console.log(alldescendants);
}

function recurseAndAdd(element, descendants) {
  if (element.newContent) descendants.push(element.id);
  var children = element.childNodes;
  for (i = 0; i < children.length; i++) {
    if (children[i].nodeType == 1) {
      recurseAndAdd(children[i]);
    }
  }
}

//change button label
function shortLabel(querySmall) {
  if (querySmall.matches) {
    document.getElementById("label-newest").innerText = "Newest";
    document.getElementById("label-oldest").innerText = "Oldest";
  }
}

function fullLabel(queryLarger) {
  if (queryLarger.matches) {
    document.getElementById("label-newest").innerText = "Newest First";
    document.getElementById("label-oldest").innerText = "Oldest First";
  }
}

// JavaScript Media Queries
var querySmall = window.matchMedia("(max-width: 460px)");
var queryLarger = window.matchMedia("(min-width: 460px)");
shortLabel(querySmall);
fullLabel(queryLarger);
querySmall.addListener(shortLabel);
queryLarger.addListener(fullLabel);
