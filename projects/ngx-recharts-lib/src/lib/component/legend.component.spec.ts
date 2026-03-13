import { TestBed } from '@angular/core/testing';
import { LegendComponent, LegendPayload } from './legend.component';
import { LegendClickEvent } from '../core/event-types';

describe('LegendComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegendComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(LegendComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('Output events', () => {
    it('should have legendClick, legendMouseEnter, legendMouseLeave outputs defined', () => {
      const fixture = TestBed.createComponent(LegendComponent);
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.legendClick).toBeDefined();
      expect(comp.legendMouseEnter).toBeDefined();
      expect(comp.legendMouseLeave).toBeDefined();
    });
  });

  describe('layout input', () => {
    it('should default layout to "horizontal"', () => {
      const fixture = TestBed.createComponent(LegendComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.layout()).toBe('horizontal');
    });

    it('should accept "vertical" layout', () => {
      const fixture = TestBed.createComponent(LegendComponent);
      fixture.componentRef.setInput('layout', 'vertical');
      fixture.detectChanges();
      expect(fixture.componentInstance.layout()).toBe('vertical');
    });
  });

  describe('align input', () => {
    it('should default align to "center"', () => {
      const fixture = TestBed.createComponent(LegendComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.align()).toBe('center');
    });

    it('should accept "left" align', () => {
      const fixture = TestBed.createComponent(LegendComponent);
      fixture.componentRef.setInput('align', 'left');
      fixture.detectChanges();
      expect(fixture.componentInstance.align()).toBe('left');
    });
  });

  describe('iconSize and iconType inputs', () => {
    it('should default iconSize to 14', () => {
      const fixture = TestBed.createComponent(LegendComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.iconSize()).toBe(14);
    });

    it('should accept custom iconSize', () => {
      const fixture = TestBed.createComponent(LegendComponent);
      fixture.componentRef.setInput('iconSize', 20);
      fixture.detectChanges();
      expect(fixture.componentInstance.iconSize()).toBe(20);
    });

    it('should accept iconType', () => {
      const fixture = TestBed.createComponent(LegendComponent);
      fixture.componentRef.setInput('iconType', 'circle');
      fixture.detectChanges();
      expect(fixture.componentInstance.iconType()).toBe('circle');
    });
  });

  describe('payload input', () => {
    it('should return empty array when no registry and no manual payload', () => {
      const fixture = TestBed.createComponent(LegendComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.resolvedPayload()).toEqual([]);
    });

    it('should use manual payload when provided', () => {
      const fixture = TestBed.createComponent(LegendComponent);
      const payload: LegendPayload[] = [
        { value: 'Series A', color: 'red' },
        { value: 'Series B', color: 'blue' },
      ];
      fixture.componentRef.setInput('payload', payload);
      fixture.detectChanges();
      expect(fixture.componentInstance.resolvedPayload()).toEqual(payload);
    });
  });
});
