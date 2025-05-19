import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Slide } from '../slide';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import type { SwiperContainer } from 'swiper/element';

register();

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

  ngOnInit(): void {
    console.log('Slides length:', this.slides.length);
  }

  async ngAfterViewInit() {
    if (!this.swiper?.nativeElement) {
      return;
    }

    const swiperEl = this.swiper.nativeElement;

    // Configuración del swiper
    Object.assign(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 20,
      pagination: true,
      initialSlide: 0,
    });

    // Inicializar swiper
    await swiperEl.initialize();

    // Agregar el event listener después de la inicialización
    swiperEl.addEventListener('slidechange', () => {
      this.currentSlideIndex = swiperEl.swiper.activeIndex;
      console.log('Current slide:', this.currentSlideIndex);
    });
  }

  async onSlideChange(event: any) {
    if (this.swiper?.nativeElement) {
      this.currentSlideIndex = this.swiper.nativeElement.swiper.activeIndex;
      console.log('Slide changed to:', this.currentSlideIndex);
    }
  }

  async goNextSlide() {
    if (this.swiper?.nativeElement) {
      await this.swiper.nativeElement.swiper.slideNext();
    }
  }

  skipOnboarding() {
    this.route.navigate(['/login']); // Asegúrate que esta ruta existe
  }
}
