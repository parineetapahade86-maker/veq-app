// lib/export-pdf.ts
import html2pdf from 'html2pdf.js';

export const downloadKnowledgeVaultPDF = (containerId: string, companyName: string) => {
  const element = document.getElementById(containerId);
  if (!element) {
    console.error("PDF container not found");
    return;
  }

  // Premium PDF Settings
  const opt = {
    margin: 15, // ✅ FIXED: Single number (15mm on all sides)
    filename: `VEQ_Knowledge_Vault_${companyName.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  // 1. Create a Premium VEQ Branded Wrapper
  const wrapper = document.createElement('div');
  wrapper.style.padding = '20px';
  wrapper.style.color = '#3A2418';
  wrapper.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  // 2. Add Professional Header
  wrapper.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #C6A15B;">
      <div>
        <h1 style="font-family: Georgia, serif; font-style: italic; color: #3A2418; font-size: 26px; margin: 0;">VEQ Knowledge Vault</h1>
        <p style="font-family: monospace; color: #806B58; font-size: 11px; margin-top: 5px; letter-spacing: 0.05em;">CONFIDENTIAL DOCUMENT • GENERATED ON ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div style="text-align: right;">
        <p style="font-family: monospace; color: #3A2418; font-weight: bold; font-size: 14px; text-transform: uppercase;">${companyName}</p>
      </div>
    </div>
  `;

  // 3. Clone the actual content and REMOVE UI buttons
  const contentClone = element.cloneNode(true) as HTMLElement;
  const uiElements = contentClone.querySelectorAll('button, input, .no-print, .filter-bar');
  uiElements.forEach(el => el.remove());

  // Clean up spacing for PDF
  contentClone.style.marginTop = '20px';
  wrapper.appendChild(contentClone);

  // 4. Add Professional Footer
  const footer = document.createElement('div');
  footer.style.marginTop = '40px';
  footer.style.paddingTop = '15px';
  footer.style.borderTop = '1px solid #E9DED0';
  footer.style.textAlign = 'center';
  footer.style.fontFamily = 'monospace';
  footer.style.color = '#806B58';
  footer.style.fontSize = '10px';
  footer.innerHTML = 'Powered by VEQ • Knowledge Continuity Platform • www.veq.app';
  wrapper.appendChild(footer);

  // 5. Generate and Download
  html2pdf().set(opt as any).from(wrapper).save();
};