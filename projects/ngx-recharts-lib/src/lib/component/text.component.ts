import { Component, input, computed, signal, effect, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TextAnchor = 'start' | 'middle' | 'end' | 'inherit';
export type TextVerticalAnchor = 'start' | 'middle' | 'end';

interface WordLine {
  words: string[];
  width?: number;
}

@Component({
  selector: 'svg:text[ngx-text]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg:tspan 
      *ngFor="let line of wordsByLines(); let i = index"
      [attr.x]="finalX()"
      [attr.dy]="i === 0 ? startDy() : lineHeight()"
      [attr.key]="line.words.join(breakAll() ? '' : ' ') + '-' + i">
      {{ line.words.join(breakAll() ? '' : ' ') }}
    </svg:tspan>
  `,
  host: {
    '[attr.x]': 'finalX()',
    '[attr.y]': 'finalY()',
    '[attr.text-anchor]': 'textAnchor()',
    '[attr.fill]': 'finalFill()',
    '[attr.transform]': 'transform()',
    '[class]': '"recharts-text " + (className() || "")'
  }
})
export class TextComponent {
  private elementRef = inject(ElementRef);

  // Inputs
  x = input<number>(0);
  y = input<number>(0);
  dx = input<number>(0);
  dy = input<number>(0);
  lineHeight = input<string | number>('1em');
  capHeight = input<string>('0.71em');
  scaleToFit = input<boolean>(false);
  textAnchor = input<TextAnchor>('start');
  verticalAnchor = input<TextVerticalAnchor>('end');
  fill = input<string>('#808080');
  angle = input<number>();
  width = input<number>();
  maxLines = input<number>();
  breakAll = input<boolean>(false);
  className = input<string>('');
  children = input<string | number>('');

  // Computed properties
  finalX = computed(() => {
    const baseX = this.x();
    const deltaX = this.dx();
    return baseX + (typeof deltaX === 'number' ? deltaX : 0);
  });

  finalY = computed(() => {
    const baseY = this.y();
    const deltaY = this.dy();
    return baseY + (typeof deltaY === 'number' ? deltaY : 0);
  });

  finalFill = computed(() => {
    const fillValue = this.fill();
    return fillValue.includes('url') ? '#808080' : fillValue;
  });

  // Word processing
  wordsByLines = computed(() => {
    const text = this.children()?.toString() || '';
    const width = this.width();
    const breakAll = this.breakAll();
    const maxLines = this.maxLines();

    if (!text) return [];

    // Simple implementation - split by spaces or characters
    let words: string[];
    if (breakAll) {
      words = text.split('');
    } else {
      words = text.split(/\s+/);
    }

    // If no width constraint, return single line
    if (!width) {
      return [{ words }];
    }

    // Simple line breaking (would need proper text measurement in real implementation)
    const lines: WordLine[] = [];
    let currentLine: string[] = [];
    
    for (const word of words) {
      // Simplified: assume each character is ~8px wide
      const estimatedWidth = (currentLine.join(' ') + ' ' + word).length * 8;
      
      if (estimatedWidth > width && currentLine.length > 0) {
        lines.push({ words: currentLine });
        currentLine = [word];
      } else {
        currentLine.push(word);
      }
      
      // Check maxLines constraint
      if (maxLines && lines.length >= maxLines) {
        break;
      }
    }
    
    if (currentLine.length > 0) {
      lines.push({ words: currentLine });
    }

    return lines;
  });

  startDy = computed(() => {
    const verticalAnchor = this.verticalAnchor();
    const wordLines = this.wordsByLines();
    const lineHeight = this.lineHeight();
    const capHeight = this.capHeight();

    switch (verticalAnchor) {
      case 'start':
        return capHeight;
      case 'middle':
        return `calc(${(wordLines.length - 1) / 2} * -${lineHeight} + (${capHeight} / 2))`;
      default: // 'end'
        return `calc(${wordLines.length - 1} * -${lineHeight})`;
    }
  });

  transform = computed(() => {
    const transforms: string[] = [];
    
    if (this.scaleToFit() && this.width()) {
      const firstLine = this.wordsByLines()[0];
      if (firstLine) {
        // Simplified scaling - would need proper text measurement
        const estimatedLineWidth = firstLine.words.join(' ').length * 8;
        const scale = this.width()! / estimatedLineWidth;
        transforms.push(`scale(${scale})`);
      }
    }
    
    const angle = this.angle();
    if (angle) {
      const x = this.finalX();
      const y = this.finalY();
      transforms.push(`rotate(${angle}, ${x}, ${y})`);
    }
    
    return transforms.length > 0 ? transforms.join(' ') : undefined;
  });
}