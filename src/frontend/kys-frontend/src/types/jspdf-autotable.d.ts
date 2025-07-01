declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    margin?: any;
    pageBreak?: string;
    rowPageBreak?: string;
    tableWidth?: string | number;
    showHead?: string;
    showFoot?: string;
    tableLineWidth?: number;
    tableLineColor?: any;
    columns?: any[];
    columnStyles?: any;
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    alternateRowStyles?: any;
    styles?: any;
    theme?: string;
    didDrawCell?: (data: any) => void;
    didDrawPage?: (data: any) => void;
    willDrawCell?: (data: any) => void;
    willDrawPage?: (data: any) => void;
    addPageContent?: (data: any) => void;
    [key: string]: any;
  }

  function autoTable(doc: jsPDF, options: UserOptions): void;
  export default autoTable;
} 