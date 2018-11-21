//foursquare
const clientSecret = "ODC4U4DJV14HN0ZV4HPYJ3YUYPBMN3YCL40JS0C0DX3NPAZC";
const versionApi = "20181101";
const clientId = "JJKCIBIBQ2L2ACKIQ2SFIIG4YFXU1UAJKSGMGUCKNYEO3TCS";
const venueSearchURL = "https://api.foursquare.com/v2/venues/explore";

//google geocoding
const geoCodingUrl = `https://maps.googleapis.com/maps/api/geocode/json`;
const geoCodingClientKey = `AIzaSyC7B7GvOsWcm329Cf0Yl7Li7tW0u5wUlxM`;

//uber
const uberClientId = "EjexP45MukV0kytXEEwo0uXUSBpz0oJZ";
const uberServerToken = " KeQZeCbDywxkCjWZ43R1fwfWYcOFZPOGKLdvJiN7";
const uberClientSecret = "rLdfDkOgnskRxk9lS6vw7JyMQLA16VSIXB72snA9";

// map variables
var map;
let state = {
  venues: [],
  markers: [],
  images: [],
  location: { lat: '' ,
   lng: '' }
};

let selectedVenue = [];

var bounds;

function getVenueImage(venueID, index) {
  const params = {
    v: versionApi,
    client_id: clientId,
    client_secret: clientSecret,
    limit: 1
  };
  const queryString = formatQueryParamsPlaces(params);
  const url = `https://api.foursquare.com/v2/venues/${venueID}/photos?${queryString}`;

  fetch(url)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    let img = data.response.photos.items[0];
    let imgURL = `${img.prefix}300x300${img.suffix}`;
    $(`#image-${venueID}`).attr("src", imgURL);
    state.images[index] = imgURL;
  })
  .catch(error => {
    console.log(`error`, error);
  })
}

//convert address to lat/long for uber 
function convertLatLong(originQuery) {
  console.log('ran')
  const geoCodingParams = {
    key: geoCodingClientKey,
    address: originQuery 
  };
  const geoCodingQueryString = formatGeoCodingParams(geoCodingParams)
  const geoUrl = geoCodingUrl + '?' + geoCodingQueryString;

  console.log(geoUrl);

  fetch(geoUrl)
  .then(response => response.json())
  .then(geoCodingResponseJson => {
    console.log('ran', geoCodingResponseJson);
    state.location.lat = geoCodingResponseJson.results[0].geometry.location.lat;
    state.location.lng = geoCodingResponseJson.results[0].geometry.location.lng;
    console.log('this is lat', state.location.lat);
    console.log('this is lng', state.location.lat )
  }) 
  .then(geoCodingResponseJson => {
     getUberEstimate(state.location.lat, state.location.lng)
     })
}


//geocoding
function formatGeoCodingParams(geoCodingParams) {
  const geoCodingQueryItems = Object.keys(geoCodingParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(geoCodingParams[key])}`)
  return geoCodingQueryItems.join('&');
}

////////////////

function getUberEstimate() {
  const uberParams = {
    start_latitude:state.location.lat,
    start_longitude: state.location.lng,
    end_latitude: selectedVenue.venue.location.lat,
    end_longitude: selectedVenue.venue.location.lng
  };
  const uberQueryString = formatUberQueryParams(uberParams)
  const uberUrl = `/uber` + '?' + uberQueryString;

  fetch(uberUrl) 
    .then(response => {
      if (response.ok) {
        return response.json()
      }
    })  .then(data=>{
      console.log(data)
    })
}

function formatUberQueryParams(uberParams) {
  const uberQueryItems = Object.keys(uberParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(uberParams[key])}`)
  return uberQueryItems.join('&');
}

//////////////////////////////////////////

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 34.0522, lng: -118.2437 },
    zoom: 3,
    zoomControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
    fullScreenControl: false,
    mapTypeControl: false,
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_CENTER,
    },
  });
  map.setOptions({ minZoom: 2, maxZoom: 28});
  bounds  = new google.maps.LatLngBounds();
}

/////////////////////////////////

$(function() {
  watchForm();
  toggleSidebar();
  retrieveClickedVenueData();
  closeModal();
  markerHover();
  removeMarkers();

});

function watchForm() {
  $("#landing-page-form").submit(event => {
    event.preventDefault();
    const placeQuery = $(".js-type-query").val();
    const originQuery = $(".js-origin-query").val();
    convertLatLong(originQuery);
    getPopularPlacesData(placeQuery, originQuery);
  });
  $("#results-page-form").submit(event => {
    event.preventDefault();
    const placeQuery = $("#search-type-input").val();
    const originQuery = $("#address-input").val();
    convertLatLong(originQuery);
    getPopularPlacesData(placeQuery, originQuery);
  });
}

//foursquare App
function getPopularPlacesData(query, originQuery, maxResults = 10) {
  const params = {
    query: query,
    near: originQuery,
    v: versionApi,
    client_id: clientId,
    client_secret: clientSecret,
    limit: maxResults
  };
  const queryString = formatQueryParamsPlaces(params);
  const url = venueSearchURL + "?" + queryString;

  fetch(url)
    .then(response => response.json())
    .then(responseJson => {
      return responseJson;
    })
    .then(responseJson => displayResults (responseJson.response.groups[0].items))
    .catch(error => alert("Whoops! We currently don't have anything available for your search. Please try another search."+ error));
}

function formatQueryParamsPlaces(params) {
  const queryvenues = Object.keys(params).map(
    key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  );
  return queryvenues.join("&");
}

function renderSidebarvenue(venue, index, imgURL) {
  return `<section class="result js-result" data-index=${index}>
  <a href=# class="js-venue-name">
  <h3 class="venue-name">${venue.venue.name}</h3>
  </a>
  <div class="venue-img-container">
  <img class="venue-img" id="image-${venue.venue.id}" src="${imgURL}">
  </div>
  <p class="address">${venue.venue.location.formattedAddress}</p>
  </section>`;
}

function setvenueMarker(venue, index) {
  var venueLocation = new google.maps.LatLng(
    venue.venue.location.lat,
    venue.venue.location.lng
  );
  var marker = new google.maps.Marker({
    position: venueLocation,
    title: venue.venue.name,
    map: map
  });
  bounds.extend(new google.maps.LatLng(marker.position.lat(), marker.position.lng()));
  state.markers[index] = marker;
}

 function removeMarkers() {
  $('.js-sidebar-submit').on('click', function(){
    for (i = 0; i < state.markers.length; i++) {
      state.markers[i].setMap(null);
   }
  })
}

function displayResults(venues) {
  $(".container").hide();
  $("#map-section").show();
  $("#sidebar").show();
  $("#show-hide").show();
  state.venues = venues;
  console.log(state.venues);
  bounds  = new google.maps.LatLngBounds();
  let renderedvenues = venues.map((venue, index) => {
    setvenueMarker(venue, index);
    getVenueImage(venue.venue.id, index)
    return renderSidebarvenue(venue, index);
  });
  map.fitBounds(bounds);
  map.panToBounds(bounds);
  map.setCenter(map.getCenter());
  $("#search-results").html(renderedvenues);
}


function toggleSidebar() {
  $("#show-hide").click(function() {
    var currentStyle = $("#sidebar").css("width");
    if (currentStyle === "0px") {
      $("#sidebar").css("width", "calc(100% - 35px)");
      $("#search-results", ".results-search-background").show();
    } else {
      $("#sidebar").css("width", "0");
      $("#search-results", ".results-search-background").hide();
    }
  });
}

function retrieveClickedVenueData() {
  $("#search-results").on("click", ".result", function(event) {
    event.preventDefault();
    let index = $(this).attr("data-index");
    let selectedVenue = state.venues[index];
    let imageURL = state.images[index];
    let venueLat = selectedVenue.venue.location.lat;
    let venueLng = selectedVenue.venue.location.lng;
    getUberEstimate(venueLat, venueLng);
      console.log('venue selected is', selectedVenue);
      displayModalWhenClicked(selectedVenue, imageURL)
  });
}

function displayModalWhenClicked(item, imageURL) {
  $(".popup-content").html(`
    <h3 class="popup-name">${item.venue.name}</h2>
    <img class="venue-img" id="image-{venue.venue.id}" src="${imageURL}">
    <p class="popup-address">${item.venue.location.formattedAddress}</p>
    <h4 class="uber-title">Uber estimate</h4>
    <p class="type-uber">Uber Type</p>
    <p>Duration</p>
    <p>Fare estimate</p>
    `);
    console.log('location of venue selected',item.venue.location.lat, item.venue.location.lng);
  $("#search-modal").show();
}

function closeModal() {
  $(".popup-overlay").click(function(event) {
    $("#search-modal").hide();
  });
}


function markerHover() {
  $("#search-results").on("mouseover", ".result", function(e) {
    var index = $(this).attr("data-index");

    state.markers[index].setAnimation(google.maps.Animation.BOUNCE);
  });

    $("#search-results").on("touchstart", ".result", function(e) {
    var index = $(this).attr("data-index");

    state.markers[index].setAnimation(google.maps.Animation.BOUNCE);
  });

  $("#search-results").on("mouseout", ".result", function(e) {
    var index = $(this).attr("data-index");
    state.markers[index].setAnimation(-1);
  });

  $("#search-results").on("touchend", ".result", function(e) {
    var index = $(this).attr("data-index");
    state.markers[index].setAnimation(-1);
  });
}

