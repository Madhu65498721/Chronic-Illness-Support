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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: 'black', color: 'white' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2em' }}>Chronic Illness Support Bot</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5em' }}>Common Questions</h2>
        {Object.keys(predefinedProblems).map((question, index) => (
          <div
            key={index}
            onClick={() => handleQuestionClick(question)}
            style={{
              cursor: 'pointer',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#333'
            }}
          >
            <FontAwesomeIcon icon={faQuestionCircle} style={{ marginRight: '10px' }} />
            {question}
          </div>
        ))}
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'scroll', marginBottom: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
        {chatLog.map((message, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start', margin: '10px 0' }}>
            {message.type === 'bot' && <FontAwesomeIcon icon={faRobot} style={{ marginRight: '10px', alignSelf: 'center' }} />}
            <span style={{ display: 'inline-block', padding: '10px', borderRadius: '5px', background: message.type === 'user' ? '#dcf8c6' : '#f1f1f1', color: 'black' }}>
              {message.message}
              {message.detailed && (
                <button onClick={() => handleDetailedRequest(message.detailed)} style={{ marginLeft: '10px', padding: '5px 10px', borderRadius: '5px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Tell me more
                </button>
              )}
              <button onClick={() => copyToClipboard(message.message)} style={{ marginLeft: '10px', padding: '5px 10px', borderRadius: '5px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faCopy} />
              </button>
            </span>
            {message.type === 'user' && <FontAwesomeIcon icon={faUser} style={{ marginLeft: '10px', alignSelf: 'center' }} />}
          </div>
        ))}
        {isLoading && <FontAwesomeIcon icon={faSpinner} spin />}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'space-between' }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '10px', color: 'black' }}
        />
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#007bff', color: '#fff', cursor: 'pointer' }}>
          ASK
        </button>
      </form>

      <footer style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#777' }}>
        © MADHU - 2024
      </footer>
    </div>
  );
}
