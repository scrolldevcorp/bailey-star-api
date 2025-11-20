// import { BaseAgent } from './base/BaseAgent';
// import { AgentType, AgentStatus, AgentContext, AgentResponse } from '../types/agent.types';

// /**
//  * Agente Orquestador
//  * Coordina la ejecución de múltiples agentes especializados
//  * Decide qué agente debe manejar cada solicitud del usuario
//  */
// export class OrchestratorAgent extends BaseAgent {
//   private subAgents: Map<AgentType, BaseAgent>;

//   constructor() {
//     super({
//       type: AgentType.ORCHESTRATOR,
//       model: 'deepseek-reasoner',
//       temperature: 0.3,
//       frequencyPenalty: 0.5,
//       presencePenalty: 0.5,
//       topP: 0.1,
//     });
    
//     this.subAgents = new Map();
//   }

//   /**
//    * Registrar un agente especializado
//    */
//   registerAgent(agent: BaseAgent): void {
//     this.subAgents.set(agent.type, agent);
//   }

//   /**
//    * Ejecutar la lógica del orquestador
//    * Analiza la entrada y delega al agente apropiado
//    */
//   async execute(input: string, context: AgentContext): Promise<AgentResponse> {
//     try {
//       this.updateStatus(AgentStatus.THINKING);

//       // Validar contexto
//       if (!this.validateContext(context)) {
//         throw new Error('Contexto inválido');
//       }

//       // TODO: Implementar lógica de clasificación de intención
//       // Determinar qué agente debe manejar la solicitud
//       // const agentType = await this.classifyIntent(input);

//       // Delegar al agente apropiado
//       const agent = this.subAgents.get(agentType);
//       if (!agent) {
//         throw new Error(`Agente no encontrado para tipo: ${agentType}`);
//       }

//       this.updateStatus(AgentStatus.EXECUTING);
//       const response = await agent.execute(input, context);

//       this.updateStatus(AgentStatus.IDLE);
//       return response;

//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   /**
//    * Clasificar la intención del usuario usando IA
//    */
//   // private async classifyIntent(input: string): Promise<AgentType> {
//   //   try {
//   //     const intent = await this.aiService.classifyIntent(input);
      
//   //     // Mapear la intención a un tipo de agente
//   //     if (intent.includes('flight') || intent.includes('vuelo')) {
//   //       return AgentType.FLIGHT;
//   //     } else if (intent.includes('hotel')) {
//   //       return AgentType.HOTEL;
//   //     } else if (intent.includes('tour')) {
//   //       return AgentType.TOUR;
//   //     }
      
//   //     // Por defecto, usar agente de vuelos
//   //     return AgentType.FLIGHT;
//   //   } catch (error) {
//   //     // Fallback a lógica simple si falla la IA
//   //     const lowerInput = input.toLowerCase();
//   //     if (lowerInput.includes('vuelo') || lowerInput.includes('flight')) {
//   //       return AgentType.FLIGHT;
//   //     }
//   //     return AgentType.FLIGHT;
//   //   }
//   // }
// }
