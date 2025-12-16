import { GoogleGenAI } from "@google/genai";
import { ConsolidatedReportItem } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateExecutiveSummary = async (
  reportData: ConsolidatedReportItem[],
  startDate: string,
  endDate: string
): Promise<string> => {
  const client = getClient();
  if (!client) return "Error: API Key no configurada.";

  const prompt = `
    Actúa como un Supervisor Senior de Perforación Diamantina.
    Analiza los siguientes datos consolidados de producción en el rango de fechas ${startDate} a ${endDate}.
    
    Datos:
    ${JSON.stringify(reportData, null, 2)}
    
    Genera un resumen ejecutivo breve (máximo 2 párrafos) destacando:
    1. El avance total en metros perforados (si los hay).
    2. Actividades auxiliares clave (mapeo, instalaciones, etc.).
    3. Una conclusión sobre la productividad del periodo.
    
    Usa un tono profesional, técnico y directo.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "No se pudo generar el resumen.";
  } catch (error) {
    console.error("Error generating report:", error);
    return "Error al conectar con el servicio de IA para generar el resumen.";
  }
};
