import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-chart">
      <h3>Simple SVG Test</h3>
      <svg width="400" height="300" style="border: 1px solid #ccc;">
        <!-- Background -->
        <rect width="400" height="300" fill="#f9f9f9" />
        
        <!-- Simple line chart -->
        <g transform="translate(40, 20)">
          <!-- Chart area -->
          <rect width="320" height="220" fill="white" stroke="#ddd" />
          
          <!-- Sample line -->
          <path 
            d="M 0,180 L 64,120 L 128,140 L 192,80 L 256,100 L 320,60"
            stroke="#8884d8" 
            stroke-width="2" 
            fill="none" />
          
          <!-- Sample dots -->
          <circle cx="0" cy="180" r="4" fill="#8884d8" stroke="white" stroke-width="1" />
          <circle cx="64" cy="120" r="4" fill="#8884d8" stroke="white" stroke-width="1" />
          <circle cx="128" cy="140" r="4" fill="#8884d8" stroke="white" stroke-width="1" />
          <circle cx="192" cy="80" r="4" fill="#8884d8" stroke="white" stroke-width="1" />
          <circle cx="256" cy="100" r="4" fill="#8884d8" stroke="white" stroke-width="1" />
          <circle cx="320" cy="60" r="4" fill="#8884d8" stroke="white" stroke-width="1" />
          
          <!-- Axes -->
          <line x1="0" y1="220" x2="320" y2="220" stroke="#666" />
          <line x1="0" y1="0" x2="0" y2="220" stroke="#666" />
          
          <!-- Labels -->
          <text x="160" y="250" text-anchor="middle" fill="#666">Sample Chart</text>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .test-chart {
      padding: 20px;
      text-align: center;
    }
  `]
})
export class TestChartComponent {}