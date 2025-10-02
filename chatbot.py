<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-device, initial-scale=1.0">
    <title>IBM Assistant Simulation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="bg-gray-100 flex items-center justify-center h-screen">

    <div class="w-full max-w-4xl h-full sm:h-[90vh] flex flex-col bg-white rounded-lg shadow-2xl">
        <!-- Header -->
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
                <h1 class="text-xl font-bold text-gray-800">IBM Orchestrator Agent</h1>
                <p class="text-sm text-gray-500">Powered by IBM Technology</p>
            </div>
             <div class="flex items-center space-x-2">
                <button class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </button>
                <button class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5" />
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 20v-5h-5" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Chat Area -->
        <div id="chat-window" class="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
            <!-- Messages will be appended here -->
        </div>

        <!-- Status Area -->
        <div id="status-area" class="px-6 pb-2 text-center text-sm text-gray-500 h-10 transition-opacity duration-300"></div>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-gray-200">
            <div class="relative">
                <input id="user-input" type="text" placeholder="Type your message..." class="w-full pl-4 pr-12 py-3 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow">
                <button id="send-button" class="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <script>
        const chatWindow = document.getElementById('chat-window');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');
        const statusArea = document.getElementById('status-area');


        let conversationState = 'INITIATE_INTERACTION';
        let clientName = '';

        function addMessage(message, sender = 'bot') {
            const messageWrapper = document.createElement('div');
            messageWrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

            const messageBubble = document.createElement('div');
            messageBubble.className = `max-w-lg lg:max-w-xl px-4 py-3 rounded-2xl shadow ${sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'}`;
            
            let html = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            const finalHtmlParts = [];
            let currentList = '';

            html.trim().split('\n').forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('- ')) {
                    currentList += `<li>${trimmedLine.substring(2)}</li>`;
                } else {
                    if (currentList) {
                        finalHtmlParts.push(`<ul class="list-disc list-inside space-y-1 mt-2">${currentList}</ul>`);
                        currentList = '';
                    }
                    if (trimmedLine) {
                       finalHtmlParts.push(`<p class="mb-2">${trimmedLine}</p>`);
                    }
                }
            });

            if (currentList) {
                finalHtmlParts.push(`<ul class="list-disc list-inside space-y-1 mt-2">${currentList}</ul>`);
            }
            
            messageBubble.innerHTML = finalHtmlParts.join('') || '<p></p>';


            const timestamp = document.createElement('div');
            timestamp.className = `text-xs mt-1 ${sender === 'user' ? 'text-blue-200 text-right' : 'text-gray-400'}`;
            timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            messageBubble.appendChild(timestamp);
            messageWrapper.appendChild(messageBubble);
            chatWindow.appendChild(messageWrapper);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }

        function updateStatus(message) {
            if (message) {
                statusArea.innerHTML = `<div class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="italic">${message}</span>
                </div>`;
            } else {
                statusArea.innerHTML = '';
            }
        }

        function handleUserInput() {
            const message = userInput.value.trim();
            if (!message) return;

            addMessage(message, 'user');
            userInput.value = '';
            
            processBotResponse(message);
        }

        function processBotResponse(userMessage) {
            let responses;
            const clientLower = clientName.toLowerCase();

            if (clientLower.includes('cognition')) {
                responses = {
                    assistantAgent: () => `Assistant Agent is checking calendar and emails...`,
                    researchAgent: () => `Research Agent is gathering internal and external data...`,
                    writerAgent: () => `Writer Agent is compiling a full report...`,
                    summariserAgent: () => `Summariser Agent is creating the final brief...`,
                    clientSummary: () => `**Client Summary:**\n**Cognition Crew** is a venture-backed AI development company specializing in creating custom large language models. As a new prospect, their primary goal is to find a scalable, cost-effective platform to train and deploy their models for enterprise clients.`,
                    meetingBrief: () => `**Meeting Brief:**\n- **Date/Time**: October 9, 2025, 9:30 AM - 10:45 AM\n- **Participants (Cognition Crew):** Dr. Aris Thorne (CEO & Co-founder), Lena Petrova (Head of Engineering)\n- **Objectives:** Introduce the IBM watsonx platform as a comprehensive solution for their AI development lifecycle, from data preparation to model deployment and governance.`,
                    recentActivity: () => `**Recent Activity & Intelligence:**\n- **Funding:** Secured $50M in Series B funding two months ago to scale operations.\n- **News:** Recently published a research paper on efficient model fine-tuning, indicating advanced technical expertise.\n- **Goal:** They are actively seeking a robust cloud partner to move from on-premise testing to a full-scale commercial offering.`,
                    suggestedActions: () => `**Suggested Next Best Actions:**\n- **Focus on watsonx.ai:** Showcase the end-to-end capabilities, especially for training and fine-tuning foundation models.\n- **Offer a Proof-of-Concept:** Propose a hands-on technical workshop and offer trial credits for the watsonx platform.\n- **Discuss Scalability & Cost:** Emphasize IBM Cloud's performance for AI workloads and the potential for significant cost savings compared to competitors.\n- **Introduce AI Governance:** Mention watsonx.governance as a key differentiator for building trust with their future enterprise clients.`
                };
            } else if (clientLower.includes('grupo contacta') || clientLower.includes('contacta')) {
                responses = {
                    assistantAgent: () => `Assistant Agent is reviewing emails, flagging a recent message from **Andrés Molina** regarding an AI proposal.`,
                    researchAgent: () => `Research Agent is accessing the proposal details and noting their concern about multi-channel scalability.`,
                    writerAgent: () => `Writer Agent is compiling a technical overview to address the scalability question.`,
                    summariserAgent: () => `Summariser Agent is creating a brief focused on resolving the client's technical query.`,
                    clientSummary: () => `**Client Summary:**\n**Grupo Contacta** is an existing customer evaluating a new proposal for AI-powered customer service solutions. They are a major player in the telecommunications support sector.`,
                    meetingBrief: () => `**Meeting Brief:**\n- **Participants (Grupo Contacta):** Andrés Molina (Director of Technology)\n- **Objectives:** Address specific questions about the scalability of our proposed AI solution and schedule a follow-up technical deep-dive.`,
                    recentActivity: () => `**Recent Activity & Intelligence:**\n- **Key Email:** Received an email from Andrés Molina requesting a technical meeting to discuss the scalability of our AI proposal in multi-channel environments (e.g., voice, chat, social).`,
                    suggestedActions: () => `**Suggested Next Best Actions:**\n- **Prepare a technical demo** focusing on the multi-channel capabilities of watsonx Assistant.\n- **Proactively schedule the meeting** with our technical team as requested by Andrés.\n- **Reference a case study** where a similar client successfully scaled their AI customer service across multiple platforms.`
                };
            } else {
                responses = {
                    assistantAgent: () => `Assistant Agent is checking calendar and emails...`,
                    researchAgent: () => `Research Agent is gathering internal and external data for **${clientName}**...`,
                    writerAgent: () => `Writer Agent is compiling a full report...`,
                    summariserAgent: () => `Summariser Agent is creating the final brief...`,
                    clientSummary: () => `**Client Summary:**\n**${clientName}** is a leading company in their industry. Their strategic goal is to leverage AI to improve efficiency.`,
                    meetingBrief: () => `**Meeting Brief:**\n- **Participants (${clientName}):** Key Stakeholders\n- **Objectives:** Introduce IBM watsonx to help them achieve their business goals.`,
                    recentActivity: () => `**Recent Activity & Intelligence:**\n- Our records show recent interest in AI and cloud solutions.\n- Market trends indicate a need for innovation in their sector.`,
                    suggestedActions: () => `**Suggested Next Best Actions:**\n- **Position watsonx.data** as the solution to their data challenges.\n- **Showcase our Granite model** for their specific use cases.\n- **Propose a follow-up workshop** on AI governance using watsonx.governance.`
                };
            }
            
            switch (conversationState) {
                case 'INITIATE_INTERACTION':
                    clientName = userMessage;
                    addMessage(`Excellent. I am deploying a team of specialized agents to prepare your brief for the **${clientName}** meeting.`);
                    conversationState = 'ASSISTANT_AGENT';
                    setTimeout(() => processBotResponse(), 1000); 
                    break;
                
                case 'ASSISTANT_AGENT':
                    updateStatus(responses.assistantAgent());
                    setTimeout(() => {
                        conversationState = 'RESEARCH_AGENT';
                        processBotResponse();
                    }, 2500);
                    break;
                
                case 'RESEARCH_AGENT':
                    updateStatus(responses.researchAgent());
                    setTimeout(() => {
                        conversationState = 'WRITER_AGENT';
                        processBotResponse();
                    }, 2500);
                    break;
                    
                case 'WRITER_AGENT':
                    updateStatus(responses.writerAgent());
                    setTimeout(() => {
                        conversationState = 'SUMMARISER_AGENT';
                        processBotResponse();
                    }, 2000);
                    break;

                case 'SUMMARISER_AGENT':
                    updateStatus(responses.summariserAgent());
                    setTimeout(() => {
                        conversationState = 'DELIVER_BRIEF';
                        processBotResponse();
                    }, 2000);
                    break;

                case 'DELIVER_BRIEF':
                    updateStatus('');
                    addMessage("Here is the final brief:");
                    setTimeout(() => addMessage(responses.clientSummary()), 1000);
                    setTimeout(() => addMessage(responses.meetingBrief()), 2000);
                    setTimeout(() => addMessage(responses.recentActivity()), 3000);
                    setTimeout(() => {
                        conversationState = 'SUGGEST_ACTIONS';
                        processBotResponse();
                    }, 4000);
                    break;
                
                case 'SUGGEST_ACTIONS':
                    addMessage(responses.suggestedActions());
                    conversationState = 'OFFER_ORCHESTRATION';
                    setTimeout(() => processBotResponse(), 1500);
                    break;

                case 'OFFER_ORCHESTRATION':
                    addMessage(`To make this process even more efficient, I can orchestrate several follow-up actions for you using a tool like **watsonx.orchestrate**. For example, I can schedule the follow-up meeting, draft a summary email based on this brief, and create a task for the technical team to prepare a demo. Shall I proceed with any of these?`);
                    conversationState = 'AWAIT_INSTRUCTION';
                    break;

                case 'AWAIT_INSTRUCTION':
                     if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('proceed') || userMessage.toLowerCase().includes('schedule')) {
                        addMessage(`Excellent. I have scheduled the follow-up meeting, drafted the summary email in your drafts folder, and assigned the demo preparation task to the technical team. Is there anything else I can assist you with?`);
                    } else {
                        addMessage(`Understood. I will stand by. Please let me know if you need anything else.`);
                    }
                    setTimeout(() => {
                       addMessage(`I am the Orchestrator Agent. Which client meeting can I help you prepare for today?`);
                       conversationState = 'INITIATE_INTERACTION';
                    }, 5000);
                    break;
            }
        }

        window.onload = () => {
             setTimeout(() => {
                addMessage(`Hello! I'm your Orchestrator Agent. Which client meeting can I help you prepare for today?`);
             }, 1000);
        };

        sendButton.addEventListener('click', handleUserInput);
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUserInput();
            }
        });
    </script>
</body>
</html>

