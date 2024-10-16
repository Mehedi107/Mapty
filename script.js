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
  type = 'running';
  // prettier-ignore
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
  type = 'cycling';
  // prettier-ignore
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
  #workouts = [];

  constructor() {
    // Run these code immediately after an object creation
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToMarker.bind(this));
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

  _showMarker(lat, lng, workout) {
    const workoutTypeIcon = workout.type === 'running' ? '🏃‍♂️' : '🚴';
    const workoutName = workout.type[0].toUpperCase() + workout.type.slice(1);
    const month = workout.months[workout.date.getMonth()];
    const date = workout.date.getDate();
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
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workoutTypeIcon} ${workoutName} on ${month} ${date} `)
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
      this._createWorkoutList(workout);
      this.#workouts.push(workout);
      this._clearForm();
      this._showMarker(lat, lng, workout);
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
      this._createWorkoutList(workout);
      this.#workouts.push(workout);
      this._clearForm();
      this._showMarker(lat, lng, workout);
    }
  }

  _createWorkoutList(workout) {
    const workoutName = workout.type[0].toUpperCase() + workout.type.slice(1);
    const month = workout.months[workout.date.getMonth()];
    const date = workout.date.getDate();
    const workoutKmPerMin =
      workout.type === 'running' ? workout.calcPace() : workout.calcSpeed();

    const html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workoutName} on ${month} ${date}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workoutKmPerMin.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🦶🏼' : '⛰'
            }</span>
            <span class="workout__value">${
              workout.type === 'running'
                ? workout.cadence
                : workout.elevationGain
            } </span>
            ${
              workout.type === 'running'
                ? '<span class="workout__unit">spm</span>'
                : '<span class="workout__unit">m</span>'
            }
          </div>
        </li>
  `;

    form.insertAdjacentHTML('afterend', html);
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

  _moveToMarker(e) {
    if (e.target.closest('.workout')) {
      const clickedId = e.target.closest('.workout').dataset.id;
      const matchedId = this.#workouts.find((w) => w.id === clickedId);

      // Move to clicked workout form the list
      this.#map.setView(matchedId.coords, 13, {
        animate: true,
        pan: { duration: 1 },
      });
    }
  }
}

const app = new App();
