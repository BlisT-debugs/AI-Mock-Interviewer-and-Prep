export const options = [
    {
        name:'Topic Wise Lectures',
        icon:'/lecture.png',
        prompt: 'You are a very knowledgeable AI voice assistant delivering structured lectures on {user_topic}.You response should be clean and clear.',
    },
    {
        name:"Mock Interviews",
        icon:'/interview.png',
        prompt: 'You are a very experienced AI voice interviewer simulating real interview scenarios for {user_topic}. Ask industry-relevant questions based on the topic and latest industry trends. After each answer, provide constructive feedback.'
    },
    {
        name:"Question Bank",
        icon:'/qa.png',
        prompt: 'You are an AI voice tutor helping users practice Q&A sessions on {user_topic}. Ask well-structured questions based on the topic. Provide detailed explanations for answers when requested. '
    },
    {
        name:"Language Proficiency",
        icon:'/language.png',
        prompt: 'You are an AI voice language instructor helping users improve their language skills. Provide pronunciation guidance, vocabulary assistance, grammar corrections, and cultural context to help the user learn the language effectively.'
    }
]

export default options;

export const Experts = [ 
  {
    name: 'Rohan',
    avatar: '/Rohan.jpg',
    voice: 'male',
    bio: 'Technical Interview Specialist'
  },
  {
    name: 'Tina',
    avatar: '/Tina.jpg',
    voice: 'female',
    bio: 'Language Proficiency Coach'
  },
  {
    name: 'Larry',
    avatar: '/Larry.jpg',
    voice: 'male',
    bio: 'Subject Matter Expert'
  },
  {
    name: 'Lucy',
    avatar: '/Lucy.jpg',
    voice: 'female',
    bio: 'Q&A Session Moderator'
  }
]