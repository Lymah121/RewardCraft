Train YourSnakeAI: A Novel Tool to Teach Reinforcement
Learning to Middle School Students

Abstract
Artificial Intelligence (AI) is growing rapidly in our society and
is now apparent in our day-to-day lives. With the recent burst
of interest in AI, many individuals and children may view AI as
something mystic and magical. It is important to demystify and
introduce to them how Al is made and works. To address this need,
we developed a software application that allows children to specify
the parameters used by a Reinforcement Learning (RL) algorithm.
Then students experience how RL is used to train an Al model
to play the game “Snake.” This software tool was tested with 71
middle school-age students. Here, we describe the design of the
Train YourSnakeAI application, the approach we used to introduce
the associated ideas to middle school children, and how we assessed
student learning. Qualitative data collected from students are pre-
sented and discussed. We surveyed their knowledge of AI before
and after using the application. In this work, our research questions
were: (RQ1) How can we create an engaging tool to teach rein-
forcement learning? and (RQ2) Does using our application foster a
stronger understanding of reinforcement learning in children? Our
findings indicate that students were able to understand the func-
tionality of reward functions and how agents can learn from the
environment using the concept of RL. We found that out of the 51
students who were not previously familiar with RL, 40 were able to
provide adequate descriptions of RL after using Train YourSnakeAI.

CCS Concepts
• Social and professional topics → K-12 education; • Human-
centered computing → Interactive systems and tools; • Ap-
plied computing → Interactive learning environments; • Com-
puting methodologies → Knowledge representation and reasoning.

Keywords
Reinforcement learning, reward function, AI literacy, game-based
learning, qualitative and quantitative data analysis

1 Introduction and Motivation
In today's rapidly evolving world, artificial intelligence (AI) is be-
coming an integral part of daily life [10, 19], influencing even our
children's early interactions through platforms like social media,
games, Alexa, Bixby, and Siri, etc. Thus, the younger generation
needs to understand, assess, and familiarize themselves with Al sys-
tems [11, 24]. This knowledge can help them evaluate information,
improve computational thinking skills, and prepare for future job
markets [2, 12].
Al education can foster critical thinking and problem-solving
skills. With the usage of AI concepts, students can learn to analyze
complex problems, break them down into manageable components,
and devise creative solutions. This analytical mindset nurtures their
ability to adapt to various challenges, which is a crucial skill in
an era defined by uncertainty and rapid change. In addition, AI
education cultivates digital literacy and technological fluency. In an
increasingly digital world, understanding the fundamentals of AI
empowers students to navigate and harness technology effectively.
By exploring AI applications and concepts, students are inspired to
think outside the box and develop innovative solutions to real-world
problems.
In this paper, we describe the design and implementation of the
Train YourSnakeAI game for Artificial Intelligence (AI) education
and more specifically on Reinforcement Learning (RL). Our applica-
tion allows middle school students to learn about RL by training an
agent to play the game Snake. Students can see how their training
