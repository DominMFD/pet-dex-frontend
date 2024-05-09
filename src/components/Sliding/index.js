import { Component } from 'pet-dex-utilities';
import { initializeSwiper, makeSwipable } from '../../utils/swiper';
import './index.scss';

const events = [
  'slide:add',
  'slide:next',
  'slide:prev',
  'slide:remove',
  'slides:clear',
];

const html = `
<div class="sliding">
  <div class="sliding__content" data-select="sliding-content">
  </div>
</div>`;

export default function Sliding({ slides = [] }) {
  Component.call(this, { html, events });

  this.slideIndex = 0;
  this.slides = [];

  this.updateSlides = () => {
    this.slides = Array.from(this.selected.get('sliding-content').children);
  };

  this.updateWidth = () => {
    this.selected.get('sliding-content').style.width =
      `${this.slides.length * 100}%`;
  };

  slides.forEach((item) => this.add(item));

  makeSwipable(this.selected.get('sliding-content'));
  initializeSwiper();

  this.selected
    .get('sliding-content')
    .addEventListener('swipe-left', () => this.next());
  this.selected
    .get('sliding-content')
    .addEventListener('swipe-right', () => this.prev());

  this.listen('mount', () =>
    document.addEventListener('click', this.setSlide(this.slides[0])),
  );
  this.listen('unmount', () =>
    document.addEventListener('click', this.clearItems()),
  );

  this.setSlide = (slide) => {
    this.slides.forEach((item) => {
      if (item === slide) {
        item.classList.add('sliding__content__slide--active');
      } else {
        item.classList.remove('sliding__content__slide--active');
      }
    });
  };
}

Sliding.prototype = Object.assign(Sliding.prototype, Component.prototype, {
  add(slide) {
    slide.classList.add('sliding__content__slide');
    this.selected.get('sliding-content').appendChild(slide);

    this.updateSlides();
    this.updateWidth();

    this.emit('slide:add', slide);
  },

  remove(slide) {
    const slideExist = this.selected.get('sliding-content').contains(slide);

    if (!slideExist) throw new Error('Slide not exist');
    this.selected.get('sliding-content').removeChild(slide);

    this.updateSlides();
    this.updateWidth();

    this.emit('slide:remove', slide);
  },

  next() {
    this.slideIndex += 1;

    if (this.slideIndex > this.slides.length - 1) this.slideIndex = 0;

    const slide =
      this.selected.get('sliding-content').children[this.slideIndex];
    const slideWidth =
      this.selected.get('sliding-content').clientWidth / this.slides.length;

    this.selected.get('sliding-content').style.transform =
      `translateX(${-this.slideIndex * slideWidth}px)`;

    this.setSlide(slide);

    this.emit('slide:next', slide);
  },

  prev() {
    this.slideIndex -= 1;

    if (this.slideIndex < 0) this.slideIndex = this.slides.length - 1;

    const slide =
      this.selected.get('sliding-content').children[this.slideIndex];
    const slideWidth =
      this.selected.get('sliding-content').clientWidth / this.slides.length;

    this.selected.get('sliding-content').style.transform =
      `translateX(${-this.slideIndex * slideWidth}px)`;

    this.setSlide(slide);

    this.emit('slide:prev', slide);
  },

  clear() {
    this.slides.forEach((slide) => this.remove(slide));

    this.emit('slides:clear');
  },
});
