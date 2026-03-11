import { TestBed } from '@angular/core/testing';
import { LabelComponent } from './label.component';

describe('LabelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelComponent],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(LabelComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('value rendering', () => {
    it('should return empty string when no value or children set', () => {
      const fixture = TestBed.createComponent(LabelComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.labelText()).toBe('');
    });

    it('should render value as string', () => {
      const fixture = TestBed.createComponent(LabelComponent);
      fixture.componentRef.setInput('value', 42);
      fixture.detectChanges();
      expect(fixture.componentInstance.labelText()).toBe('42');
    });

    it('should prefer children over value', () => {
      const fixture = TestBed.createComponent(LabelComponent);
      fixture.componentRef.setInput('value', 10);
      fixture.componentRef.setInput('children', 'Custom');
      fixture.detectChanges();
      expect(fixture.componentInstance.labelText()).toBe('Custom');
    });

    it('should apply formatter function to value', () => {
      const fixture = TestBed.createComponent(LabelComponent);
      fixture.componentRef.setInput('value', 100);
      fixture.componentRef.setInput('formatter', (v: any) => `$${v}`);
      fixture.detectChanges();
      expect(fixture.componentInstance.labelText()).toBe('$100');
    });
  });

  describe('position input', () => {
    it('should default position to "center"', () => {
      const fixture = TestBed.createComponent(LabelComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.position()).toBe('center');
    });

    it('should accept custom position', () => {
      const fixture = TestBed.createComponent(LabelComponent);
      fixture.componentRef.setInput('position', 'top');
      fixture.detectChanges();
      expect(fixture.componentInstance.position()).toBe('top');
    });
  });

  describe('offset input', () => {
    it('should default offset to 5', () => {
      const fixture = TestBed.createComponent(LabelComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.offset()).toBe(5);
    });

    it('should accept custom offset', () => {
      const fixture = TestBed.createComponent(LabelComponent);
      fixture.componentRef.setInput('offset', 10);
      fixture.detectChanges();
      expect(fixture.componentInstance.offset()).toBe(10);
    });
  });

  describe('fill input', () => {
    it('should default fill to #666', () => {
      const fixture = TestBed.createComponent(LabelComponent);
      fixture.detectChanges();
      expect(fixture.componentInstance.fill()).toBe('#666');
    });

    it('should accept custom fill color', () => {
      const fixture = TestBed.createComponent(LabelComponent);
      fixture.componentRef.setInput('fill', '#333');
      fixture.detectChanges();
      expect(fixture.componentInstance.fill()).toBe('#333');
    });
  });
});
