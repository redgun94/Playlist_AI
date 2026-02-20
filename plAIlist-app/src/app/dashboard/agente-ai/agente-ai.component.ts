import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-agente-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './agente-ai.component.html',
  styleUrl: './agente-ai.component.css'
})
export class AgenteAiComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: ChatMessage[] = [
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de música IA. Puedo ayudarte a crear playlists, encontrar artistas, recomendarte canciones basadas en tu estado de ánimo, o responder cualquier pregunta sobre música. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ];

  userInput: string = '';
  isLoading: boolean = false;
  apiKey: string = '';
  selectedModel: string = 'gemini-2.0-flash';

  constructor(private http: HttpClient) {
    if (typeof localStorage !== 'undefined') {
      this.apiKey = localStorage.getItem('gemini_api_key') || '';
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  async sendMessage(): Promise<void> {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: this.userInput,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const currentInput = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    try {
      if (!this.apiKey) {
        this.showApiKeyPrompt();
        this.isLoading = false;
        return;
      }

      const response = await this.callAI(currentInput);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      this.messages.push(assistantMessage);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.',
        timestamp: new Date()
      };
      this.messages.push(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  private async callAI(prompt: string): Promise<string> {
    const context = `Eres un asistente musical experto llamado "PlAIlist". 
Tu función principal es ayudar a los usuarios a:
1. Crear y gestionar playlists de música
2. Buscar artistas, álbumes y canciones
3. Recomendar música basada en estados de ánimo o géneros
4. Explicar información sobre artistas y canciones
5. Crear mezclas de canciones basadas en preferencias

Responde de manera útil, amigable y concisa. Si el usuario pregunta sobre algo que no sea música, gracefully redirige la conversación hacia temas musicales.

Mensaje del usuario: ${prompt}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${this.apiKey}`;
    
    const body = {
      contents: [{ parts: [{ text: context }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    };

    return new Promise((resolve, reject) => {
      this.http.post<any>(url, body).subscribe({
        next: (response) => {
          if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
            resolve(response.candidates[0].content.parts[0].text);
          } else {
            reject(new Error('Invalid response'));
          }
        },
        error: (error) => {
          console.error('AI API Error:', error);
          reject(error);
        }
      });
    });
  }

  saveApiKey(): void {
    if (this.apiKey.trim() && typeof localStorage !== 'undefined') {
      localStorage.setItem('gemini_api_key', this.apiKey.trim());
      this.apiKey = '';
    }
  }

  showApiKeyPrompt(): void {
    const apiKeyPrompt: ChatMessage = {
      role: 'assistant',
      content: 'Para usar el asistente de IA, necesito una clave API de Google Gemini. Por favor, ingresa tu API key en el campo correspondiente arriba y guarda. Si no tienes una, puedes obtenerla en https://aistudio.google.com/app/apikey',
      timestamp: new Date()
    };
    this.messages.push(apiKeyPrompt);
  }

  clearChat(): void {
    this.messages = [
      {
        role: 'assistant',
        content: '¡Hola! Soy tu asistente de música IA. Puedo ayudarte a crear playlists, encontrar artistas, recomendarte canciones basadas en tu estado de ánimo, o responder cualquier pregunta sobre música. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      }
    ];
  }
}
