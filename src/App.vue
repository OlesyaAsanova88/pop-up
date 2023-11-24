<script setup>
import { ref, onMounted, computed, watch } from "vue";
import {getAll, getModels, getCars} from './api/api';

const isOpen = ref(false);

const carsAll = ref([]);
const carModels = ref([]);
const carsResult = ref([]);
const oneCar = ref([]);

const search = ref("");
const search2 = ref("");

const selectedCountry = ref("");

const month = ref(36);
const percent = ref(0);

const brand = ref("");
const model = ref("");


const creditAmount = ref(0); // Сумма кредита
const interestRate = ref(3.9); // Годовая процентная ставка
const monthlyPayment = ref(0);

const name = ref("");
const phone = ref("");

const isFormValid = computed(() => {
  const phoneRegex = /^(\+7) \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
  return name.value.trim().length > 0 && phoneRegex.test(phone.value);
});

const formattedMonthlyPayment = computed(() => {
  return Number(monthlyPayment.value).toLocaleString('ru-RU');
});

// Функция расчета ежемесячного платежа
const calculateMonthlyPayment = () => {
  const P = Number(creditAmount.value) * (1 - Number(percent.value) / 100); // учитываем первоначальный взнос
  const r = (Number(interestRate.value) / 100) / 12; // месячная процентная ставка
  const n = Number(month.value); // срок кредитования в месяцах
 

  if (r === 0) {
    monthlyPayment.value = (P / n).toFixed(0);
    return;
  }

  monthlyPayment.value = (P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)).toFixed(0);
};

// Следим за изменениями в month, percent и creditAmount
watch([month, percent, creditAmount], () => {
  calculateMonthlyPayment();
});


/*sort */
const compareByTotalProduct = (a, b) => {
  return b.total_product - a.total_product;
}

/*formatn number */

const formatNumber = (number) => {
  if (typeof number !== 'number') {
    return number; // Вернуть неизмененное значение, если это не число
  }
  return number.toLocaleString(); // Форматировать число с пробелами между разрядами
};

/*deseble tub*/

const isBrandDisabled = computed(() => {
  return stateStep.value.step >= 2 && !brand.value;
});

const isModelDisabled = computed(() => {
  return stateStep.value.step >= 3 && (!brand.value || !model.value);
});

const isCarDisabled = computed(() => {
  return (
    stateStep.value.step >= 4 && (!brand.value || !model.value || !car.value)
  );
});

/*search car and modal */
const filteredCars = computed(() => {
  return carsAll.value
    .sort(compareByTotalProduct)
    .filter((car) => {
      if (selectedCountry.value === "Иномарка") {
        return car.country !== "Китай" && car.country !== "Россия";
      }
      return car.pagetitle.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()) &&
             (selectedCountry.value === "" || car.country === selectedCountry.value);
    });
});

const selectCountry = (country) => {
  selectedCountry.value = country;
};



const filteredModels = computed(() => {
  return carModels.value.filter((modal) =>
    modal.pagetitle
      .toLocaleLowerCase()
      .includes(search2.value.toLocaleLowerCase())
  );
});

/* total month & percent */
const total = computed(() => {
  return month.value;
});
const total2 = computed(() => {
  return percent.value;
});


/*open model chenge */
const toggle = (event) => {
  isOpen.value = !isOpen.value;

  if (!isOpen.value) {
    stateStep.value = { step: 1, active: 1 };
  }
}

const closeModal = () => {
  isOpen.value = false;
  stateStep.value = { step: 1, active: 1 }; 
};

const tabConrol = (id) => {
  stateStep.value.step = id;
  console.log(id, stateStep);
};

const stateStep = ref({
  step: 1,
  active: 1,
});

/* get  carsAll */
const getAllHandler = async () => {
  const data = await getAll();

  carsAll.value = data?.filter(model => model.total_product > 0);
}

const getModelsHandler = async (id) => {
  const data = await getModels(id);

  carModels.value = data?.filter(model => model.total_product > 0);

  stateStep.value.active = 2;
  stateStep.value.step = 2;
}


const getCarsHandler = async (id) => {
  const data = await getCars(id);

  carsResult.value = data;

  stateStep.value.active = 3;
  stateStep.value.step = 3;
}


const oneCarHandler = (id) => {
  const selectedCar = carsResult.value.find((car) => car.id === id);
  if (selectedCar) {
    oneCar.value = [selectedCar];
    creditAmount.value = Number(selectedCar.price); // Устанавливаем цену автомобиля
    calculateMonthlyPayment(); // Пересчитываем ежемесячный платеж
  }
  stateStep.value.active = 4;
  stateStep.value.step = 4;
}

onMounted(() => {
  getAllHandler();
  calculateMonthlyPayment(); // Вызываем при монтировании для инициализации
});
</script>

<template>
  <div class="pop-up__wrapper" >
    <div @click="toggle"  class="pop-up__selection-car">Выбрать машину</div>
  </div>

  <div v-if="isOpen"  class="pop-up" @click.self="closeModal">
    <div class="pop-up__modal">
      <div class="pop-up__modal-header" v-if="stateStep.step !== 4 && stateStep.step !== 5">
        <h2>Выбор автомобиля</h2>
        <img @click="toggle" src="@/assets/img/close.svg" alt="close" />
      </div>
      <div class="pop-up__modal-nav" v-if="stateStep.step !== 4 && stateStep.step !== 5">
        <ol>
          <li
            @click.stop="tabConrol(1)"
            :class="{ 'active-item': stateStep.step >= 1 }"
            :disabled="isBrandDisabled"
            class="pop-up__modal-nav__item active-item"
          >
            Марка<img src="@/assets/img/arrow-right.svg" alt="" />
          </li>
          <li
            @click="tabConrol(2)"
            :class="{ 'active-item': stateStep.step >= 2 }"
            :disabled="isModelDisabled"
            class="pop-up__modal-nav__item"
          >
            Модель <img src="@/assets/img/arrow-right.svg" alt="arrow" />
          </li>
          <li
            @click="tabConrol(3)"
            :class="{ 'active-item': stateStep.step >= 3 }"
            :disabled="isCarDisabled"
            class="pop-up__modal-nav__item"
          >
            Автомобиль
          </li>
        </ol>
      </div>

      <!-- 1е окно -->
      <template v-if="stateStep.step === 1">
        

        <div class="pop-up__modal__chose-block">
          <h3 class="pop-up__modal__title">Марка</h3>

          <div class="pop-up__modal__country">
            <span @click="selectCountry('Россия')">отечественные</span>
            <span @click="selectCountry('Иномарка')">иномарки</span>
            <span @click="selectCountry('Китай')">китайские</span>
          </div>

        </div>

        <label class="pop-up__modal__search" for="serch">
          <div><img src="@/assets/img/serch-icon.png" alt="serch-icon" /></div>
        </label>

      <input
        v-model.trim="search"
        class="pop-up__modal__input"
        id="serch"
        type="serch"
        placeholder="Марка"
        />

        <div class="pop-up__modal__content">
          <div
            v-for="car in filteredCars"  
            :key="car.id"
            class="pop-up__modal__list"
            :class="{'pop-up__modal__list-disabled': isBrandDisabled}"
          >
            <div
              @click="getModelsHandler(car.id)"
              class="pop-up__modal__list-item"
            >
              <div class="pop-up__modal-logo">
                <img :src="car.logo" alt="car-icon" class="pop-up__modal-img" />
              </div>
              <span>{{ car.pagetitle }}</span>
            </div>
            <div class="pop-up__modal__list-num">
              {{ car.total_product }}
            </div>
        
          </div>
        </div>
      </template>

      <!-- 2e окно -->
      <template v-if="stateStep.step === 2">
        <h3 class="pop-up__modal__title">Модель</h3>

        <label class="pop-up__modal__search" for="serch2">
          <div><img src="@/assets/img/serch-icon.png" alt="serch-icon" /></div>
        </label>

        <input
          v-model.trim="search2"
          class="pop-up__modal__input"
          id="serch2"
          type="serch"
          placeholder="Модель"
        />

        <div class="pop-up__modal__content">
          <div
            v-for="modal in filteredModels"
            :key="modal.id"
            class="pop-up__modal__list"
            :class="{'pop-up__modal__list-disabled': isModelDisabled}"
          >
            <div
              @click="getCarsHandler(modal.id)"
              class="pop-up__modal__list-item"
            >
              <span>{{ modal.pagetitle }}</span>
            </div>
            <div class="pop-up__modal__list-num">{{ modal.total_product }}</div>
          </div>
        </div>
      </template>
      <!-- 3ее окно -->
      <template v-if="stateStep.step === 3">
        <h3 class="pop-up__modal__title">
          <img src="@/assets/img/SortAscending.png" alt="sort" />
          По актуальности
        </h3>

        <div class="car-block">
          <div class="car-block__contant">
            <div
              v-for="modal in carsResult"
              :key="modal.id"
              class="pop-up__modal__render"
              :class="{'pop-up__modal__list-disabled': isCarDisabled}"
            >
              <div class="pop-up__modal__header">
                <h4>{{ modal.pagetitle }}</h4>
                <span class="pop-up__modal__span"> {{ modal.price ? formatNumber(modal.price) : ''}} ₽</span>
              </div>

              <div class="pop-up__modal__car">
                <img
                  :src="'https://marcar.ru/' + modal.image"
                  alt="photo-auto"
                />

                <div class="pop-up__modal__text">
                  {{ modal.run && modal.run[0] ? formatNumber(modal.run[0]) : '' }} км,
                  {{ modal.engine_power && modal.engine_power[0] ? formatNumber(modal.engine_power[0]) : ''}}, 
                  {{ modal.body_type && modal.body_type[0] ? formatNumber(modal.body_type[0]) : ''}},
                  {{modal.color && modal.color[0] ? formatNumber(modal.body_type[0]) : '' }}
                </div>
              </div>

              <!-- <div class="pop-up__modal__stock">В наличае</div> -->

              <button
                @click="oneCarHandler(modal.id)"
                class="pop-up__modal__btn"
              >
                Выбрать
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- 4е окно калькулятора -->

      <template v-if="stateStep.step === 4">
        <div class="model-calculator">
          <div class="pop-up__calculator">

            <div class="pop-up__block">
             <div>
              <h2 class="pop-up__calculator-title">
                Автокредит от
                <span class="pop-up__calculator-num">3.9%</span>
              </h2>
             </div>
              <div @click="toggle"><img src="./assets/img/close.svg" alt=""></div>
            </div> 

            <div v-for="auto in oneCar" :key="auto.id" >
            
              <div class="pop-up__container">
                <div class="pop-up__container-text">
                  <h3>{{ auto.pagetitle }}</h3>
                  <p>Цена: {{ formatNumber(auto.price) }} ₽</p>
                  <p> {{ auto.engine_power[0] }} </p>
                  <p> {{ auto.modification_id[0] }}</p>
                  <p>Пробег: {{ auto.run[0] }} км</p>
                </div>
                <div class="pop-up__container-img">
                  <img :src="'https://marcar.ru/' + auto.image" alt="auto">
                </div>
              </div>

            </div> 
          
            <form action="/" >
            
              <h4 class="pop-up__calculator-label">
                Срок кредитования, мес.: <span> {{ total }} мес.</span>
              </h4>
              <input
                v-model="month"
                type="range"
                min="12"
                max="84"
                
                class="pop-up__calculator-slider"
              />
              <div class="pop-up__calculator-number">
                <span>12</span>
                <span>24</span>
                <span>36</span>
                <span>48</span>
                <span>60</span>
                <span>72</span>
                <span>84</span>
              </div>
              <h4 class="pop-up__calculator-label">
                Первонач. взнос, %: <span> {{ total2 }} ₽</span>
              </h4>
              <input
                v-model="percent"
                type="range"
                min="0"
                max="80"
                
                class="pop-up__calculator-slider"
              />
              <div class="pop-up__calculator-number">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50</span>
                <span>60</span>
                <span>70</span>
                <span>80</span>
              </div>
              <div class="pop-up__calculator-label">
                <label for="name">ФИО</label>
              </div>
              <input
                v-model="name"
                class="pop-up__calculator-input"
                type="text"
                id="name"
                placeholder="Иванов Иван Иванович"
              />

              <div class="pop-up__calculator-label">
                <label for="name">Телефон для связи</label>
              </div>
              <input
                class="pop-up__calculator-input"
                type="tel"
                v-model="phone"
                id="phone"
                placeholder="+7"
              />

              <div class="pop-up__calculator-label">Наше предложение</div>

              <div class="pop-up__calculator-offer">
                <div>
                  <span class="pop-up__calculator-num pop-up__calculator-title"
                    >3.9%</span
                  >
                  <p>Ставка по кредиту</p>
                </div>
                <div>
                  <span class="pop-up__calculator-num pop-up__calculator-title">
                    {{ formattedMonthlyPayment }} ₽
                  </span>
                  <p>Ежемесячный платеж</p>
                </div>
              </div>

              <button 
              :disabled="!isFormValid"
              @click="stateStep.step = 5"
              class="pop-up__calculator-btn" 
              type="submit"
              >
                Продолжить
              </button>

              <a
                href="politika-konfidenczialnosti"
                class="pop-up__calculator-agreement"
              >
                Нажимая кнопку «Продолжить», я подтверждаю наличие гражданства
                РФ и соглашаюсь на обработку личных данных
              </a>
            </form>
          </div>
        </div>
        </template>

        <template v-if="stateStep.step === 5">
          <div class="pop-up__close-btn" @click="toggle"><img src="./assets/img/close.svg" alt="close"></div>
          <div class="pop-up__info-block">
            <span>Спасибо за обращение, сообщение отправлено.</span>
            <button @click="stateStep.step = 4">Отправить заново</button>
          </div>
        </template>


      </div>
    </div>
</template>

