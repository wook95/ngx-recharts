import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LineChartComponent } from './line-chart.component';
import { ScaleService } from '../services/scale.service';

const SAMPLE_DATA = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 200 },
  { name: 'Mar', value: 150 },
];

describe('LineChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineChartComponent],
      providers: [ScaleService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(LineChartComponent);
    fixture.componentRef.setInput('data', SAMPLE_DATA);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Input defaults', () => {
    it('should default width to 600', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.detectChanges();
      expect(fixture.componentInstance.width()).toBe(600);
    });

    it('should default height to 400', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.detectChanges();
      expect(fixture.componentInstance.height()).toBe(400);
    });

    it('should accept custom width and height inputs', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.componentRef.setInput('width', 800);
      fixture.componentRef.setInput('height', 500);
      fixture.detectChanges();
      expect(fixture.componentInstance.width()).toBe(800);
      expect(fixture.componentInstance.height()).toBe(500);
    });

    it('should default margin to { top: 10, right: 5, bottom: 5, left: 5 }', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.detectChanges();
      expect(fixture.componentInstance.margin()).toEqual({ top: 10, right: 5, bottom: 5, left: 5 });
    });

    it('should accept a custom margin input', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.componentRef.setInput('margin', { top: 20, right: 20, bottom: 20, left: 20 });
      fixture.detectChanges();
      expect(fixture.componentInstance.margin()).toEqual({ top: 20, right: 20, bottom: 20, left: 20 });
    });

    it('should bind data input correctly', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.detectChanges();
      expect(fixture.componentInstance.data()).toEqual(SAMPLE_DATA);
    });
  });

  describe('Computed properties', () => {
    it('should compute plotWidth from width minus margin left/right', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.componentRef.setInput('width', 600);
      fixture.componentRef.setInput('margin', { top: 10, right: 10, bottom: 10, left: 10 });
      fixture.detectChanges();
      expect(fixture.componentInstance.plotWidth()).toBe(580);
    });

    it('should compute plotHeight from height minus margin top/bottom', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.componentRef.setInput('height', 400);
      fixture.componentRef.setInput('margin', { top: 20, right: 5, bottom: 20, left: 5 });
      fixture.detectChanges();
      expect(fixture.componentInstance.plotHeight()).toBe(360);
    });

    it('should use width as actualWidth when no responsive service', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.componentRef.setInput('width', 700);
      fixture.detectChanges();
      expect(fixture.componentInstance.actualWidth()).toBe(700);
    });

    it('should use height as actualHeight when no responsive service', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.componentRef.setInput('height', 450);
      fixture.detectChanges();
      expect(fixture.componentInstance.actualHeight()).toBe(450);
    });
  });

  describe('Output events', () => {
    it('should have chartClick output defined', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.detectChanges();
      expect(fixture.componentInstance.chartClick).toBeDefined();
    });

    it('should have chartMouseMove output defined', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.detectChanges();
      expect(fixture.componentInstance.chartMouseMove).toBeDefined();
    });

    it('should have chartMouseEnter output defined', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.detectChanges();
      expect(fixture.componentInstance.chartMouseEnter).toBeDefined();
    });

    it('should have chartMouseLeave output defined', () => {
      const fixture = TestBed.createComponent(LineChartComponent);
      fixture.componentRef.setInput('data', SAMPLE_DATA);
      fixture.detectChanges();
      expect(fixture.componentInstance.chartMouseLeave).toBeDefined();
    });
  });
});
