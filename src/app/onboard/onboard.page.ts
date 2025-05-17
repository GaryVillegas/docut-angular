import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Slide } from '../slide';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import type { SwiperContainer } from 'swiper/element';

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.page.html',
  styleUrls: ['./onboard.page.scss'],
  standalone: false,
})
export class OnboardPage implements OnInit {
  @ViewChild('swiper') swiper?: ElementRef<SwiperContainer>;

  currentSlideIndex = 0;
  slides: Slide[] = [
    {
      id: '1',
      title: 'Encuentra tu peluquería cercana.',
      description:
        'con tu localización podremos saber que peluquerías tienes cerca.',
      image: 'assets/onboardimage/location-tracking.svg',
    },
    {
      id: '2',
      title: 'Agenda Más Fácil.',
      description:
        'con tu localización podremos saber que peluquerías tienes cerca.',
      image: 'assets/onboardimage/date-picker.svg',
    },
    {
      id: '3',
      title: 'Encuentra tu peluquería cercana.',
      description:
        'con tu localización podremos saber que peluquerías tienes cerca.',
      image: 'assets/onboardimage/informed-decision.svg',
    },
  ];

  constructor(private route: Router) {}

  ngOnInit() {
    this.initSwiper();
  }

  async initSwiper() {
    const swiper = this.swiper?.nativeElement;
    if (swiper) {
      await customElements.whenDefined('swiper-container');
      Object.assign(swiper, {
        slidesPerView: 1,
        centeredSlides: true,
      });
      swiper.initialize();
      // Agregar el evento swiperSlideChange
      swiper.addEventListener('swiperslidechange', () => {
        this.currentSlideIndex = swiper.swiper.activeIndex;
      });
    }
  }

  slideChanged() {
    if (this.swiper?.nativeElement) {
      this.currentSlideIndex = this.swiper.nativeElement.swiper.activeIndex;
    }
  }

  goNextSlide() {
    if (this.swiper?.nativeElement) {
      this.swiper.nativeElement.swiper.slideNext();
    }
  }

  skipOnboarding() {
    this.route.navigate(['']);
  }
}
