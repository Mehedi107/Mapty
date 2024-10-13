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

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #workout = [];

  constructor() {
    // Run these code immediately after an object creation
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('Could not get your location.')
      );
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    // Insert map to map div
    this.#map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling click on the map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showMarker(lat, lng) {
    // Show marker on the map
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          minWidth: 50,
          maxWidth: 300,
          closeButton: false,
          autoClose: false,
          closeOnClick: false,
          className: `${type}-popup`,
        })
      )
      .setPopupContent(`${type[0].toUpperCase() + type.slice(1)}`)
      .openPopup();
  }

  _newWorkout(e) {
    e.preventDefault();

    // Get coordinates
    const { lat, lng } = this.#mapEvent.latlng;

    // Collect input values
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    // Check input type
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check valid input
      if (!distance > 0 || !duration > 0 || !cadence > 0) {
        this._clearForm();
        return alert('Input have to be a positive number.');
      }

      // Create new object
      const workout = new Running([lat, lng], distance, duration, cadence);
      this.#workout.push(workout);
      this._clearForm();
      this._showMarker(lat, lng);
    }

    // Check input type
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // Check valid input
      if (!distance > 0 || !duration > 0 || !elevation > 0) {
        this._clearForm();
        return alert('Input have to be a positive number.');
      }

      // Create new object
      const workout = new Cycling([lat, lng], distance, duration, elevation);
      this.#workout.push(workout);
      this._clearForm();
      this._showMarker(lat, lng);
    }
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _showForm(e) {
    this.#mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _clearForm() {
    // hide form
    form.classList.add('hidden');

    // Clear input fields
    [inputCadence, inputDistance, inputDuration, inputElevation].forEach(
      (input) => (input.value = '')
    );
  }
}

const app = new App();
