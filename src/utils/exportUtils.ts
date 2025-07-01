
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportFlowchartAsPDF = async (elementId: string, filename: string = 'flowchart') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasAspectRatio = canvas.height / canvas.width;
    const calcHeight = pdfWidth * canvasAspectRatio;

    if (calcHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, calcHeight);
    } else {
      const calcWidth = pdfHeight / canvasAspectRatio;
      pdf.addImage(imgData, 'PNG', (pdfWidth - calcWidth) / 2, 0, calcWidth, pdfHeight);
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

export const exportFlowchartAsImage = async (elementId: string, filename: string = 'flowchart') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Create download link
    canvas.toBlob((blob) => {
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    });
  } catch (error) {
    console.error('Error exporting image:', error);
    throw error;
  }
};

export const exportDataAsCSV = (data: any[], filename: string = 'workflow-data') => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
