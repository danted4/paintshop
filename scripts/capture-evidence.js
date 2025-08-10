import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);
const evidenceDir = join(projectRoot, 'evidence');

// Ensure evidence directory exists
if (!existsSync(evidenceDir)) {
  mkdirSync(evidenceDir, { recursive: true });
}

async function captureEvidence() {
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for CI/CD
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Set viewport sizes to test different screen sizes
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'laptop', width: 1366, height: 768 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ];

  const evidence = {
    timestamp: new Date().toISOString(),
    issues: [],
    screenshots: [],
    measurements: {},
    console_logs: [],
    network_requests: []
  };

  // Capture console logs
  page.on('console', msg => {
    evidence.console_logs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });

  // Capture network requests
  page.on('response', response => {
    evidence.network_requests.push({
      url: response.url(),
      status: response.status(),
      contentType: response.headers()['content-type']
    });
  });

  try {
    console.log('🚀 Starting evidence collection...');
    
    // Connect to preview server (port 4173)
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
    
    for (const viewport of viewports) {
      console.log(`📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for layout to settle
      
      // Take full page screenshot
      const screenshotPath = join(evidenceDir, `${viewport.name}-fullpage.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      evidence.screenshots.push(`${viewport.name}-fullpage.png`);
      
      // Take viewport screenshot
      const viewportScreenshotPath = join(evidenceDir, `${viewport.name}-viewport.png`);
      await page.screenshot({ 
        path: viewportScreenshotPath, 
        fullPage: false 
      });
      evidence.screenshots.push(`${viewport.name}-viewport.png`);
      
      // Measure page dimensions and scroll behavior
      const measurements = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        
        return {
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          document: {
            width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
            height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
          },
          scroll: {
            maxX: window.scrollMaxX || (document.documentElement.scrollWidth - window.innerWidth),
            maxY: window.scrollMaxY || (document.documentElement.scrollHeight - window.innerHeight),
            currentX: window.scrollX,
            currentY: window.scrollY
          },
          hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
          hasVerticalScroll: document.documentElement.scrollHeight > window.innerHeight
        };
      });
      
      evidence.measurements[viewport.name] = measurements;
      
      // Check for scroll issues
      if (measurements.hasHorizontalScroll) {
        evidence.issues.push({
          type: 'horizontal_scroll',
          viewport: viewport.name,
          description: 'Horizontal scroll detected - content wider than viewport',
          severity: 'high'
        });
      }
      
      if (measurements.hasVerticalScroll && measurements.scroll.maxY > viewport.height * 0.5) {
        evidence.issues.push({
          type: 'excessive_vertical_scroll',
          viewport: viewport.name,
          description: 'Excessive vertical scroll - content much taller than viewport',
          severity: 'medium'
        });
      }
      
      // Test specific UI interactions
      console.log(`🧪 Testing interactions on ${viewport.name}...`);
      
      // Test canvas settings modal
      try {
        await page.click('.new-canvas-btn');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const modalScreenshot = join(evidenceDir, `${viewport.name}-canvas-modal.png`);
        await page.screenshot({ path: modalScreenshot });
        evidence.screenshots.push(`${viewport.name}-canvas-modal.png`);
        
        // Close modal
        await page.click('.close-btn');
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        evidence.issues.push({
          type: 'interaction_error',
          viewport: viewport.name,
          description: `Failed to open canvas settings: ${error.message}`,
          severity: 'high'
        });
      }
      
      // Test help modal
      try {
        await page.click('.help-btn');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const helpScreenshot = join(evidenceDir, `${viewport.name}-help-modal.png`);
        await page.screenshot({ path: helpScreenshot });
        evidence.screenshots.push(`${viewport.name}-help-modal.png`);
        
        // Close modal
        await page.click('.close-btn');
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        evidence.issues.push({
          type: 'interaction_error',
          viewport: viewport.name,
          description: `Failed to open help modal: ${error.message}`,
          severity: 'medium'
        });
      }
      
      // Test image upload flow
      try {
        await page.click('.load-image-btn');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const uploadScreenshot = join(evidenceDir, `${viewport.name}-upload-screen.png`);
        await page.screenshot({ path: uploadScreenshot });
        evidence.screenshots.push(`${viewport.name}-upload-screen.png`);
        
        // Go back
        await page.click('.back-btn');
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        evidence.issues.push({
          type: 'interaction_error',
          viewport: viewport.name,
          description: `Failed to test upload flow: ${error.message}`,
          severity: 'medium'
        });
      }
      
      // Analyze element spacing and layout
      const layoutAnalysis = await page.evaluate(() => {
        const elements = {
          header: document.querySelector('.app-header'),
          main: document.querySelector('.app-main'),
          editorHeader: document.querySelector('.editor-header'),
          canvas: document.querySelector('.canvas-container'),
          toolbar: document.querySelector('.paint-canvas .toolbar') || document.querySelector('.photo-editor .editor-controls')
        };
        
        const analysis = {};
        
        Object.entries(elements).forEach(([name, element]) => {
          if (element) {
            const rect = element.getBoundingClientRect();
            const styles = window.getComputedStyle(element);
            
            analysis[name] = {
              dimensions: {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left
              },
              spacing: {
                margin: styles.margin,
                padding: styles.padding
              },
              overflow: {
                x: styles.overflowX,
                y: styles.overflowY
              }
            };
          }
        });
        
        return analysis;
      });
      
      evidence.measurements[viewport.name].layout = layoutAnalysis;
    }
    
    // Generate detailed report
    const report = generateReport(evidence);
    const reportPath = join(evidenceDir, 'analysis-report.md');
    writeFileSync(reportPath, report);
    
    console.log('✅ Evidence collection complete!');
    console.log(`📁 Evidence saved to: ${evidenceDir}`);
    console.log(`📊 Report: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Error during evidence collection:', error);
    evidence.issues.push({
      type: 'collection_error',
      description: error.message,
      severity: 'critical'
    });
  } finally {
    await browser.close();
  }
  
  // Save raw evidence data
  const evidencePath = join(evidenceDir, 'evidence.json');
  writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
  
  return evidence;
}

function generateReport(evidence) {
  const criticalIssues = evidence.issues.filter(i => i.severity === 'critical');
  const highIssues = evidence.issues.filter(i => i.severity === 'high');
  const mediumIssues = evidence.issues.filter(i => i.severity === 'medium');
  
  return `# PaintShop UI Analysis Report

Generated: ${evidence.timestamp}

## 🚨 Critical Issues (${criticalIssues.length})
${criticalIssues.map(issue => `- **${issue.type}**: ${issue.description}`).join('\n')}

## ⚠️ High Priority Issues (${highIssues.length})
${highIssues.map(issue => `- **${issue.type}** (${issue.viewport || 'all'}): ${issue.description}`).join('\n')}

## 📋 Medium Priority Issues (${mediumIssues.length})
${mediumIssues.map(issue => `- **${issue.type}** (${issue.viewport || 'all'}): ${issue.description}`).join('\n')}

## 📐 Layout Measurements

${Object.entries(evidence.measurements).map(([viewport, data]) => `
### ${viewport.toUpperCase()} (${data.viewport.width}x${data.viewport.height})

**Scroll Behavior:**
- Horizontal scroll: ${data.hasHorizontalScroll ? '❌ YES' : '✅ NO'}
- Vertical scroll: ${data.hasVerticalScroll ? '❌ YES' : '✅ NO'}
- Document size: ${data.document.width}x${data.document.height}
- Max scroll: ${data.scroll.maxX}x${data.scroll.maxY}

**Layout Elements:**
${data.layout ? Object.entries(data.layout).map(([element, info]) => `
- **${element}**: ${info.dimensions.width}x${info.dimensions.height} (top: ${info.dimensions.top}, left: ${info.dimensions.left})
  - Margin: ${info.spacing.margin}
  - Padding: ${info.spacing.padding}
  - Overflow: ${info.overflow.x}/${info.overflow.y}
`).join('') : 'No layout data available'}
`).join('\n')}

## 📸 Screenshots Captured
${evidence.screenshots.map(screenshot => `- ${screenshot}`).join('\n')}

## 🔧 Recommendations

Based on the analysis:

1. **Fix Horizontal Scroll**: Ensure all content fits within viewport width
2. **Optimize Vertical Space**: Reduce excessive padding/margins
3. **Improve Mobile Layout**: Stack elements vertically on small screens
4. **Canvas Container**: Should take most available space
5. **Header/Toolbar**: Should be compact and not waste vertical space

## 📊 Console Logs (${evidence.console_logs.length})
${evidence.console_logs.slice(0, 10).map(log => `- [${log.type}] ${log.text}`).join('\n')}
${evidence.console_logs.length > 10 ? `\n... and ${evidence.console_logs.length - 10} more` : ''}

## 🌐 Network Requests (${evidence.network_requests.length})
${evidence.network_requests.slice(0, 5).map(req => `- ${req.status} ${req.url}`).join('\n')}
${evidence.network_requests.length > 5 ? `\n... and ${evidence.network_requests.length - 5} more` : ''}
`;
}

// Run the evidence collection
captureEvidence().catch(console.error);