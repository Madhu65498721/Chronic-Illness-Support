"use client";
import { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRobot, faSpinner, faQuestionCircle, faCopy } from '@fortawesome/free-solid-svg-icons';
import bot from '../app/bot.png';

const predefinedProblems = {
  "How can I manage my chronic illness effectively?": {
    short: "Consistent medication, healthy diet, and regular check-ups.",
    long: "Managing a chronic illness effectively involves a combination of consistent medication adherence, maintaining a balanced and nutritious diet, and scheduling regular check-ups with your healthcare provider. It's also important to stay informed about your condition, engage in regular physical activity as advised by your doctor, and have a support system in place for emotional and practical assistance."
  },
  "What lifestyle changes can help with chronic illness management?": {
    short: "Healthy eating, regular exercise, and stress management.",
    long: "Adopting a healthy lifestyle is crucial for managing chronic illnesses. This includes eating a diet rich in fruits, vegetables, whole grains, and lean proteins while avoiding processed foods and excessive sugar. Regular physical activity, tailored to your abilities and condition, can improve overall health and reduce symptoms. Additionally, managing stress through techniques such as mindfulness, yoga, or counseling can significantly impact your well-being and ability to manage your illness."
  },
  "How important is medication adherence for chronic illness?": {
    short: "Very important to control symptoms and prevent complications.",
    long: "Medication adherence is critical in controlling the symptoms of chronic illnesses and preventing complications. Taking your medications as prescribed ensures that you are getting the full benefit of the treatment, which can stabilize your condition and improve your quality of life. Skipping doses or not following the prescribed regimen can lead to worsening symptoms, progression of the illness, and even hospitalization. Always discuss any concerns or side effects with your healthcare provider to find the best treatment plan for you."
  },
  "Where can I find support for managing my chronic illness?": {
    short: "Support groups, online communities, and healthcare providers.",
    long: "Support for managing chronic illness can be found through various resources. Joining support groups, either in person or online, can provide a sense of community and shared experiences that can be incredibly helpful. Online communities and forums are also great places to connect with others facing similar challenges. Additionally, your healthcare providers, including doctors, nurses, and counselors, can offer support and guidance tailored to your specific needs. Don't hesitate to reach out to family and friends as well, as having a robust support system is vital for managing chronic illnesses."
  }
};

const chronicIllnessKeywords = [
  "chronic illness", "medication", "diet", "check-ups", "support system", "physical activity", "well-being", "health", "symptoms", "complications", "treatment", "condition", "healthy eating", "exercise", "stress management", "support groups", "online communities", "healthcare providers", "support", "management", "long-term", "persistent", "continuous", "illness", "chronic condition"
];

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    setChatLog((prevChatLog) => [...prevChatLog, { type: 'user', message: inputValue }]);
    processMessage(inputValue);
    setInputValue('');
  };

  const isChronicIllnessRelated = (message) => {
    return chronicIllnessKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const processMessage = (message) => {
    if (isChronicIllnessRelated(message)) {
      const problem = predefinedProblems[message];
      if (problem) {
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          { type: 'bot', message: problem.short, detailed: problem.long }
        ]);
      } else {
        sendMessage(message);
      }
    } else {
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { type: 'bot', message: "Sorry, I can only provide information related to chronic illness management." }
      ]);
    }
  };

  const sendMessage = async (message) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`;
    const headers = { 'Content-Type': 'application/json' };
    const data = { contents: [{ parts: [{ text: message }] }] };

    setIsLoading(true);
    console.log('API Key:', process.env.NEXT_PUBLIC_GEMINI_API_KEY); // Logging API key
    console.log('Sending request to API:', url);
    console.log('Request data:', data);

    try {
      const response = await axios.post(url, data, { headers });
      console.log('Response:', response); // Logging the response
      if (response.data.candidates && response.data.candidates.length > 0) {
        const botMessage = response.data.candidates[0].content.parts[0].text;
        setChatLog((prevChatLog) => [
          ...prevChatLog,
          { type: 'bot', message: botMessage, detailed: null }
        ]);
      } else {
        throw new Error('No candidates in response');
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message); // Enhanced error logging
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { type: 'bot', message: `Sorry, something went wrong. Please try again. Error: ${error.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question) => {
    const problem = predefinedProblems[question];
    if (problem) {
      setChatLog((prevChatLog) => [
        ...prevChatLog,
        { type: 'bot', message: problem.short, detailed: problem.long }
      ]);
    }
  };

  const handleDetailedRequest = (detailedMessage) => {
    setChatLog((prevChatLog) => [
      ...prevChatLog,
      { type: 'bot', message: detailedMessage }
    ]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Text copied to clipboard!");
    });
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-center text-3xl font-bold mb-6">Chronic Illness Support Bot</h1>

      <div className="mb-6">
        <h2 className="text-center text-2xl mb-4">Common Questions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(predefinedProblems).map((question, index) => (
            <div
              key={index}
              onClick={() => handleQuestionClick(question)}
              className="cursor-pointer p-4 border border-gray-700 rounded-lg flex items-center bg-gray-800 hover:bg-gray-700 transition"
            >
              <FontAwesomeIcon icon={faQuestionCircle} className="mr-2 text-lg" />
              {question}
            </div>
          ))}
        </div>
      </div>

      <div className="max-h-96 overflow-y-scroll mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800">
        {chatLog.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            {message.type === 'bot' && <FontAwesomeIcon icon={faRobot} className="mr-2 self-center text-lg text-green-500" />}
            <div className={`inline-block p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}>
              {message.message}
              {message.detailed && (
                <button onClick={() => handleDetailedRequest(message.detailed)} className="ml-2 px-2 py-1 rounded-lg bg-blue-600 text-white text-sm">
                  Tell me more
                </button>
              )}
              <button onClick={() => copyToClipboard(message.message)} className="ml-2 px-2 py-1 rounded-lg bg-gray-600 text-white text-sm">
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </div>
            {message.type === 'user' && <FontAwesomeIcon icon={faUser} className="ml-2 self-center text-lg text-blue-500" />}
          </div>
        ))}
        {isLoading && <FontAwesomeIcon icon={faSpinner} spin className="block mx-auto text-2xl" />}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 p-3 rounded-lg border border-gray-700 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition">
          ASK
        </button>
      </form>

      <footer className="mt-6 text-center text-gray-500 text-sm">
        © MADHU - 2024
      </footer>
    </div>
  );
}
