'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

const showPosition = (position) => {
  const { latitude, longitude } = position.coords;

  //   Insert map to map div
  map = L.map('map').setView([latitude, longitude], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Handling click on the map
  map.on('click', function (e) {
    mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  });
};

const showError = () => alert('Could not get your location.');

// Get current position
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(showPosition, showError);
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  // Clear input fields
  [inputCadence, inputDistance, inputDuration, inputElevation].forEach(
    (input) => {
      input.value = '';
      input.blur();
    }
  );

  // Show marker on the map
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        minWidth: 50,
        maxWidth: 300,
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Workout')
    .openPopup();
});

// Change input type
inputType.addEventListener('change', function () {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});
