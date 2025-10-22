import { Component, input, computed, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export type TextAnchor = 'start' | 'middle' | 'end' | 'inherit';
export type TextVerticalAnchor = 'start' | 'middle' | 'end';

interface WordWithComputedWidth {
  word: string;
  width: number;
}

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
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

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

  // Word processing with proper text measurement
  wordsByLines = computed(() => {
    const text = this.children()?.toString() || '';
    const width = this.width();
    const scaleToFit = this.scaleToFit();
    const breakAll = this.breakAll();
    const maxLines = this.maxLines();

    if (!text) return [];

    // SSR or no width constraint - simple split
    if (!this.isBrowser || (!width && !scaleToFit)) {
      const words = text.split(/[ \f\n\r\t\v\u2028\u2029]+/);
      return [{ words }];
    }

    // Calculate word widths
    const wordsWithWidth = this.calculateWordWidths(text, breakAll);
    const spaceWidth = breakAll ? 0 : this.measureText('\u00A0');

    // Calculate lines (width is guaranteed to be defined here)
    return this.calculateWordsByLines(wordsWithWidth, spaceWidth, width!, scaleToFit, maxLines);
  });

  private measureText(text: string): number {
    if (!this.isBrowser) return text.length * 8;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return text.length * 8;
    
    // Use default font or get from element
    context.font = '12px sans-serif';
    return context.measureText(text).width;
  }

  private calculateWordWidths(text: string, breakAll: boolean): WordWithComputedWidth[] {
    const words = breakAll ? text.split('') : text.split(/[ \f\n\r\t\v\u2028\u2029]+/);
    return words.map(word => ({
      word,
      width: this.measureText(word)
    }));
  }

  private calculateWordsByLines(
    words: WordWithComputedWidth[],
    spaceWidth: number,
    lineWidth: number | undefined,
    scaleToFit: boolean,
    maxLines?: number
  ): WordLine[] {
    const calculate = (wordsToCalc: WordWithComputedWidth[]): WordLine[] => {
      return wordsToCalc.reduce((result, { word, width }) => {
        const currentLine = result[result.length - 1];

        if (
          currentLine &&
          (scaleToFit || !lineWidth || currentLine.width! + width + spaceWidth < lineWidth)
        ) {
          currentLine.words.push(word);
          currentLine.width! += width + spaceWidth;
        } else {
          result.push({ words: [word], width });
        }

        return result;
      }, [] as WordLine[]);
    };

    const originalResult = calculate(words);

    // No maxLines or scaleToFit - return as is
    if (!maxLines || scaleToFit) {
      return originalResult;
    }

    // Check overflow
    const findLongestLine = (lines: WordLine[]) =>
      lines.reduce((a, b) => (a.width! > b.width! ? a : b));
    
    const overflows = lineWidth
      ? originalResult.length > maxLines || findLongestLine(originalResult).width! > lineWidth
      : originalResult.length > maxLines;

    if (!overflows) {
      return originalResult;
    }

    // Binary search for ellipsis truncation
    const text = this.children()?.toString() || '';
    const suffix = '…';
    let start = 0;
    let end = text.length - 1;
    let trimmedResult: WordLine[] | undefined;

    while (start <= end) {
      const middle = Math.floor((start + end) / 2);
      const tempText = text.slice(0, middle) + suffix;
      const tempWords = this.calculateWordWidths(tempText, this.breakAll());
      const result = calculate(tempWords);

      const doesOverflow = lineWidth
        ? result.length > maxLines || findLongestLine(result).width! > lineWidth
        : result.length > maxLines;

      if (doesOverflow) {
        end = middle - 1;
      } else {
        trimmedResult = result;
        start = middle + 1;
      }
    }

    return trimmedResult || originalResult;
  }

  startDy = computed(() => {
    const verticalAnchor = this.verticalAnchor();
    const wordLines = this.wordsByLines();
    const lineHeight = this.lineHeight();
    const capHeight = this.capHeight();

    switch (verticalAnchor) {
      case 'start':
        return capHeight;
      case 'middle': {
        const offset = (wordLines.length - 1) / 2;
        if (offset === 0) return `calc(${capHeight} / 2)`;
        return `calc(${offset} * -${lineHeight} + (${capHeight} / 2))`;
      }
      default: {
        const lines = wordLines.length - 1;
        if (lines === 0) return '0';
        return `calc(${lines} * -${lineHeight})`;
      }
    }
  });

  transform = computed(() => {
    const transforms: string[] = [];
    
    if (this.scaleToFit() && this.width()) {
      const firstLine = this.wordsByLines()[0];
      if (firstLine && firstLine.width) {
        const scale = this.width()! / firstLine.width;
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