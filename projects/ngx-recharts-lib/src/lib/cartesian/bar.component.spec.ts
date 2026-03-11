import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BarComponent } from './bar.component';
import { ScaleService } from '../services/scale.service';
import { ChartMouseEvent } from '../core/event-types';

describe('BarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarComponent],
      providers: [ScaleService],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(BarComponent);
    // dataKey is required — set it via componentRef
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have barClick output', () => {
    const fixture = TestBed.createComponent(BarComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.detectChanges();
    expect(fixture.componentInstance.barClick).toBeDefined();
  });

  it('should have barMouseEnter and barMouseLeave outputs', () => {
    const fixture = TestBed.createComponent(BarComponent);
    fixture.componentRef.setInput('dataKey', 'revenue');
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    expect(comp.barMouseEnter).toBeDefined();
    expect(comp.barMouseLeave).toBeDefined();
  });

  it('should emit ChartMouseEvent on handleBarClick', () => {
    const fixture = TestBed.createComponent(BarComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    const emitted: ChartMouseEvent[] = [];
    comp.barClick.subscribe((e: ChartMouseEvent) => emitted.push(e));

    const mouseEvent = new MouseEvent('click');
    const payload = { name: 'Jan', value: 100 };
    comp.handleBarClick(mouseEvent, payload, 0);

    expect(emitted.length).toBe(1);
    expect(emitted[0].dataKey).toBe('value');
    expect(emitted[0].payload).toEqual(payload);
    expect(emitted[0].index).toBe(0);
    expect(emitted[0].nativeEvent).toBe(mouseEvent);
  });

  it('should emit ChartMouseEvent on handleBarMouseEnter', () => {
    const fixture = TestBed.createComponent(BarComponent);
    fixture.componentRef.setInput('dataKey', 'sales');
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    const emitted: ChartMouseEvent[] = [];
    comp.barMouseEnter.subscribe((e: ChartMouseEvent) => emitted.push(e));

    comp.handleBarMouseEnter(new MouseEvent('mouseenter'), { name: 'Feb', sales: 200 }, 1);

    expect(emitted.length).toBe(1);
    expect(emitted[0].index).toBe(1);
    expect(emitted[0].value).toBe(200);
  });

  it('should return empty bars when no data is provided', () => {
    const fixture = TestBed.createComponent(BarComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    expect(comp.bars()).toEqual([]);
  });

  it('should compute bars when data is provided', () => {
    const fixture = TestBed.createComponent(BarComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.componentRef.setInput('data', [
      { name: 'A', value: 100 },
      { name: 'B', value: 200 },
    ]);
    fixture.componentRef.setInput('chartWidth', 400);
    fixture.componentRef.setInput('chartHeight', 300);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const bars = comp.bars();
    expect(bars.length).toBe(2);
    bars.forEach(bar => {
      expect(bar.width).toBeGreaterThan(0);
      expect(bar.height).toBeGreaterThan(0);
    });
  });

  it('should resolve radius to number when radius is array', () => {
    const fixture = TestBed.createComponent(BarComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.componentRef.setInput('radius', [4, 4, 0, 0]);
    fixture.detectChanges();
    expect(fixture.componentInstance.resolvedRadius()).toBe(4);
  });

  it('should resolve radius to number when radius is scalar', () => {
    const fixture = TestBed.createComponent(BarComponent);
    fixture.componentRef.setInput('dataKey', 'value');
    fixture.componentRef.setInput('radius', 6);
    fixture.detectChanges();
    expect(fixture.componentInstance.resolvedRadius()).toBe(6);
  });

  describe('fill and stroke inputs', () => {
    it('should default fill to #8884d8 and stroke to none', () => {
      const fixture = TestBed.createComponent(BarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.fill()).toBe('#8884d8');
      expect(comp.stroke()).toBe('none');
    });

    it('should accept custom fill and stroke values', () => {
      const fixture = TestBed.createComponent(BarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('fill', '#ff0000');
      fixture.componentRef.setInput('stroke', '#000000');
      fixture.detectChanges();
      const comp = fixture.componentInstance;
      expect(comp.fill()).toBe('#ff0000');
      expect(comp.stroke()).toBe('#000000');
    });
  });

  describe('hide input', () => {
    it('should default hide to false', () => {
      const fixture = TestBed.createComponent(BarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(false);
    });

    it('should respect hide input when set to true', () => {
      const fixture = TestBed.createComponent(BarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('hide', true);
      fixture.detectChanges();
      expect(fixture.componentInstance.hide()).toBe(true);
    });
  });

  describe('barMouseLeave event emission', () => {
    it('should emit ChartMouseEvent on handleBarMouseLeave', () => {
      const fixture = TestBed.createComponent(BarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      const comp = fixture.componentInstance;

      const emitted: ChartMouseEvent[] = [];
      comp.barMouseLeave.subscribe((e: ChartMouseEvent) => emitted.push(e));

      const payload = { name: 'Mar', value: 150 };
      comp.handleBarMouseLeave(new MouseEvent('mouseleave'), payload, 2);

      expect(emitted.length).toBe(1);
      expect(emitted[0].dataKey).toBe('value');
      expect(emitted[0].index).toBe(2);
      expect(emitted[0].value).toBe(150);
    });
  });

  describe('stackId input', () => {
    it('should default stackId to undefined', () => {
      const fixture = TestBed.createComponent(BarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.stackId()).toBeUndefined();
    });

    it('should accept a stackId string', () => {
      const fixture = TestBed.createComponent(BarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('stackId', 'stack-a');
      fixture.detectChanges();
      expect(fixture.componentInstance.stackId()).toBe('stack-a');
    });
  });

  describe('barSize input', () => {
    it('should default barSize to undefined', () => {
      const fixture = TestBed.createComponent(BarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.detectChanges();
      expect(fixture.componentInstance.barSize()).toBeUndefined();
    });

    it('should accept a numeric barSize', () => {
      const fixture = TestBed.createComponent(BarComponent);
      fixture.componentRef.setInput('dataKey', 'value');
      fixture.componentRef.setInput('barSize', 20);
      fixture.detectChanges();
      expect(fixture.componentInstance.barSize()).toBe(20);
    });
  });
});
