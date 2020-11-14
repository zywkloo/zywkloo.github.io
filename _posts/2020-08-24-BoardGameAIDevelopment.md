---
layout: post
title:  "Board Game A.I.: from Deep Blue to Alpha Go"
image: ''
date:   2020-08-24 00:06:31
tags:
- AI Ethics
description: 'A Synthesis of Board Game A.I. development'
categories:
- AI Ethics
---

Yiwei Zhang

### Abstract

In 1997, the game between Deep Blue and Kasparov brought artificial intelligence (A.I.) into the public eye; 20 years later, AlphaGo's overwhelming victory over Lee Sedol once again made A.I. a hot topic. Though both defeated the board game world champions, the most crucial difference between the two generations of A.I. is that Deep Blue is still a chess-specific A.I. based on brute force. At the same time, without any specific domain knowledge, AlphaGo can evolve based on machine learning. This difference determines that Deep Blue is just a symbolic milestone, while AlphaGo is more practical for real-life implementation. Thus, the new generation A.I. like AlphaGo may affect the board game and game players more deeply.

*Keywords*: artificial intelligence, board game, the algorithm

## 1. **Contemporary A.I. and board games**

1. A.I. development

Artificial intelligence, most known as A.I., dates from the summer of 1956 on the leafy campus of Dartmouth College (Vella, 2017), where artificial intelligence was essentially described as machines that can simulate human's learning or other features of intelligence. Now A.I. has been one of the hottest research fields in science and engineering, which also truly affects each person's life from communication, transportation, shopping, entertainment to basic living.

In decades of years, A.I. has developed so fast that Russell and Norvig (2010) point out that "the creation of human-level intelligence and beyond," once accomplished by a human, "would change the lives of a majority of humankind" (p. 1051). Russell and Norvig (2010) further emphasize the ethical consequence that those super-machines at a certain level might "threaten human autonomy, freedom, and even survival" (p. 1051).

There has been live evidence of this statement right now: alpha Go developed by Google DeepMind group. With deep learning ability, this A.I. has made the threat into reality and shocked the whole world by defeating dozens of top human Go players with straight landslide wins (Going places; artificial intelligence, 2017).

2. Board games and A.I.

So far, five board games have been officially defined as mind sports by the 1st World Mind Sports Games: bridge, chess, draughts, Go and xiangqi (Chinese chess) (World Bridge Games Makes an Impressive Debut, 2008). Unlike A.I., board games have been fruits of human wisdom for thousands of years, but now these mind sports, especially chess and Go, may have become the top two board games affected by A.I.'s development heavily. For example, Kasparov and Greengard (2017) believe that after thousands of years of human dominance, the game is over now, and machines will be better than humans at chess forever.

After the narrow 1-match win made by Deep Blue on chess 20 years ago, A.I. has made defeating human players not challenging, with a 3-0 clean win to Ke (Going places; artificial intelligence, 2017). A.I. is progressing so fast that humans cannot practice continuously; likewise, 24 hours every day without rest (Atkinson, 2017). Another reason is the hardware development provides more vital computation ability than ever. Correspondingly, the computation strategy made significant progress from the hardware- heavy brute force to the software-heavy machine learning algorithm, which also optimized the outcome's accuracy.

3. Methodology

After the algorithm comparison and research synthesis on the different implementations between Deep Blue and Alpha Go, including hardware dependencies and searching strategy, the insight may indicate a brighter future for human players and board game A.I.

It might be true that A.I. from now on would suppress the human players of board games, but analysis and evidence are supporting more proof that at least in the short term, human players may take full advantage of the development of the board game A.I.

## 2. **Algorithm: Deep Blue vs Alpha Go**

1. Deep Blue's Algorithm

On the whole, Deep Blue is a set of hardware dedicated to chess, and most of the logic is implemented with circuits in the form of "Chess Chips". There is a smaller amount of software responsible for scheduling and some high-level functions on the chess chip.

The core of the Deep Blue algorithm is based on brute force exhaustion:

- Generate all possible moves.
- Perform a search as deep-first as possible.
- Continuously evaluate the situation to try to find the best move.

The Deep Blue chess chip contains three main components: the Move Generator, the Evaluation Function, and the Search Controller. Each component's design serves the goal of "optimizing search speed" (Campbell et al., 2002).

The move module is responsible for generating possible moves. The chess move module's core is an 8\*8 combinational logic circuit array, representing 64 grids of the chessboard. The chess move rules are embedded in the array in the form of hardware circuits so that the chess move module can give legal moves. There are additional logic circuits outside the core for detecting and generating special moves (such as "translocation of king cars") (Campbell et al., 2002).

The evaluation module is the most critical part of the entire chip, occupying 2/3 of the chip area, more than half of the logic transistors and more than 80% of the memory transistors. The evaluation module is divided into three parts: the "position evaluation," the "endgame evaluation," and the "slow evaluation" (Campbell et al., 2002).

"Piece evaluation" scores the current positions of all pieces on the board. The scores of different pieces at different positions are pre-calculated by the software and written into the hardware. "Endgame evaluation" has also pre-stored a series of valuation rules specifically for endgames, such as the rule of "King centralization bonus". The endgame evaluation sub-module also tracks all pawns' positions in the form of an 8\*8 combinational logic circuit array and calculates whether the pawn has crossed the opponent's king and whether it can rush to the opponent's bottom line to advance. Since the logic is embedded in the hardware, both the evaluation of the chess piece's position and the evaluation of the endgame only requires one clock cycle to complete the calculation. (Campbell et al., 2002).

The search controller implements a minimum-window alpha-beta search algorithm, also known as the alpha-beta pruning algorithm, which can quickly reduce the search's size (Campbell et al., 2002).

Deep Blue's software patch is also specially designed to work with hardware. The software part is responsible for scheduling a search of up to 32 chess chips in parallel and is responsible for software evaluation of a large-scale planning situation. Deep Blue's software is also connected to the endgame database of "only five pieces left." Once an endgame with only five pieces left will directly search for the best move from this database. (Campbell et al., 2002).

2. AlphaGo's Algorithm

AlphaGo is a pure software program that can run on general-purpose hardware. It is said that some of the programs use TensorFlow (Miller, 2016).

The core algorithm of AlphaGo is based on machine learning. In the first stage of training, AlphaGo only imitates chess players' moves based on information unrelated to rules. By training a network with data from 30 million games, it can then predict human players' next position with more than 50% accuracy. It is worth noting that at this stage, AlphaGo knows nothing about the rules of Go, just imitating it aimlessly. Nevertheless, since professional chess players will not violate the rules, it is equivalent to teaching AlphaGo to follow the rules of Go (Silver et al., 2016).

In the second stage of training, AlphaGo began to play chess with itself: the current strategy network would be playing with the networks in the past iterations, which will be used for self-reinforcing training. At this stage, the only rule of Go is introduced: reward the winning game. After this stage of training, AlphaGo surpassed all Go software. When played against Pachi, the most robust open-source Go software, AlphaGo can achieve an 85% winning rate (Silver et al., 2016).

.In the third stage of training, AlphaGo generates 30 million new training data samples from different Go compositions in different chess games during the self-playing game to train the composition evaluation function. The three-stage training strategy network is mixed into the Monte Carlo tree search algorithm to predict the potential situations of a chess game and evaluate them simultaneously (Silver et al., 2016).

In the entire algorithm, the concept of "winning" is the only input into the Go rule's training process. Also, AlphaGo has no knowledge of Go rules and no advanced Go unique concepts. The first stage of training is entirely based on simple game data to achieve considerable predictive effects. This process has significant values in many areas that require the function of "prediction" or “forecast”.

## 3. **An insight for board game and game A.I.**

1. Technical metrics and computational mode

The Deep Blue II, which played against Kasparov in 1997 and won, is a 30-node R.S./ 6000 supercomputer, with 16 chess chips deployed on each node, a total of 480 chess chips concurrently (Campbell et al., 2002). Due to the embedding of a large number of dedicated chess logic and hardware implementation, Deep Blue does not have much reusability for IBM's subsequent artificial intelligence (such as Watson) (Ferrucci et al., 2010).

The hardware used by AlphaGo is much more powerful. The distributed version of the game against Lee Sedol uses 1920 CPUs and 280 GPUs, and it is said that this version of AlphaGo has used Google's self-made "tensor processing unit" (TPU) (Miller, 2016). Google claims that this chip is optimized explicitly for TensorFlow, and its computational efficiency is an order of magnitude higher than the GPU (Miller, 2016). Since it contains almost no domain-specific knowledge and runs based on general-purpose hardware, AlphaGo's software is believed to be very simple. Most machine learning algorithms can be used to solve problems in other fields.

With powerful hardware and software improvement progress, some scientists and mathematicians believe the time of A.I. explosion, or so-called technical singularity, is drawing near. For example, mathematics professor and science fiction author Vernor Vinge (1993) states that, within thirty years, humans will have the technology to create superhuman intelligence. Shortly after that, the human era will end. It is not a coincidence that many scientists and entrepreneurs also predict this threat. Bill Gates, Stephen Hawking and Elon Musk all think A.I. would be a vital concern or even a summoned demon (Peckham, 2017)

However, even if capable in a longer future, the most potential A.I. player is not created for replacements of players or competing for the championship against humans. DeepMind, the development group of AlphaGo, verifies that this machine will assist biological brains but not replace them in the end by helping people to find out new solutions to problems (Going places; artificial intelligence, 2017).

2. The changes in chess and Go games under A.I. development

In China, the training fees of senior Go players is one primary income source. However, when the A.I. online training shows up in recent years, more and more teenagers choose to be trained via the online platform.

Frias and Trivino (2016) discuss the possibility of robots playing sports with humans or themselves in the future. Using four questions named Frias-Trivino test, they do not think robots can be a real player due to the lack of the understanding of rules, the will to develop skills, and the joy while playing (Frias & Trivino, 2016).

3. The future of board game players with A.I.

Even for the top professional players, it looks tough to come through the sense of loss after being defeated by a strange and powerful enemy that is still growing and learning without rest and fear.

Garry Kasparov (2017) explains in his new book, he did not feel stressed, but he recalls that when he lost, he did hate the feeling. This defeat to A.I. on mind games not only represents the end of the man keeping winning against machines in the game but also begins a new era "for the rest of human history, as the timeline draws into infinity, machines will be better than humans at chess" (p.248). If the top players did feel desperate, will the others feel anything different?

Nevertheless, to a larger scale, the former world champion insists there is nothing to be afraid of even when facing the future's total loss. One reason is that the singularity when machines own "minds" like humans is still much far away. The other one is that with the combination of machines' calculating power, humans' creativity, and the other exclusive abilities, like purposes, Kasparov (2017) believes in a positive future for the technology.

To consider further, if the players combine the advantages of humans and machines, like adopting A.I. online training, the benefits of embracing A.I. will outweigh the potential dangers or frustrated feelings. Because machines do not feel tired, human players can easily find a super coach anywhere and anytime. More hopefully, DeepMind, the creator of AlphaGo, thinks the machines will end up as assistants, but not replacements (Going places; artificial intelligence, 2017).

Right now, we are more than glad to see after losing to AlphaGo, Mr. Ke studied the computer's moves and found new ideas. He went on 22 straight wins against human opponents, an impressive feat even for the top one player in the world (Going places; artificial intelligence, 2017). This is proof, just as Kasparov (2017) points out, with the exclusive human creativity and the help of A.I., once players can make progress faster, we would be surprised by wisdom and uniqueness of our own, not the fear about what we made.

## 4. **Board games with A.I. in the future** 

According to the analysis above, we can see that the new generation A.I. like AlphaGo, could improve the board game skills just like human players, even without the embedding of the game rules. This ability could be wildly implemented in other fields, like online tutoring and computerized forecast of professional leagues.

Also, there is no recent evidence showing that A.I. would be a threat to board game players. People would not recognize and admire A.I. equally as human players of board games since inhuman A.I. does not have the same structure and mental specialties as humans. Although professional players may lose to A.I., with the enlightenment of A.I., players would be aspired to work harder and learn new skills faster.

### *References*

Atkinson, P. (2017). 'The Robots are Coming!': Perennial problems with technological progress. The Design Journal, 20(sup1), S4120-S4131.

Campbell, M., Hoane Jr., a. J., & Hsu, F. (2002). Deep Blue. Artificial Intelligence, 134(1-2), 57– 83.

Ferrucci, D., Brown, E., Chu-Carroll, J., Fan, J., Gondek, D., Kalyanpur, A. a., … Welty, C. (2010). Building Watson: An Overview of the DeepQA Project. A.I. Magazine, 31(3), 59–79. Frias, F. J. (2016). The defining components of the cyborg: cyborg athletes, fictional or real? Sport, Ethics and philoSophy, 10(1), 97-111.

Frias, F. J., & Trivino, J. L. (2016). Will robots ever play sports? *Sports, Ethics and Philosophy*, 67-82.

Going places; artificial intelligence. (2017, 10). *The Economist, 425*(9063), 76.

Hsu, F., Campbell, M., & Hoane, J. (1995). Deep Blue system overview. In ICS '95: Proceedings of the 9th international conference on Supercomputing (pp. 240–244).

Kasparov, G., & Greengard, M. (2017). *Deep thinking: Where machine intelligence ends and human creativity begins.* Public Affairs.

Miller, P. *Google reveals the mysterious custom hardware that powers AlphaGo*. (2016, May 19). Retrieved from The Verger: https://www.theverge.com/circuitbreaker/2016/5/19/11716818/ google-alphago-hardware-asic-chip-tensor-processor-unit-machine-learning

Peckham, M. (2017). Future-proofing. *Time Artificial Intelligence: The Future of Humankind*, p. 90.

Russell, S., & Norvig, P. (2010). *Artificial Intelligence: A modern approach,3rd ed.* Pearson Education, Inc.

Silver, D., Huang, A., Maddison, C. J., Guez, A., Sifre, L., van den Driessche, G., … Hassabis, 

4. (2016). Mastering the game of Go with deep neural networks and tree search. Nature, 529(7587), 484–489.

Vella, M. (2017). How A.I. is transforming our world. *Time Artificial Intelligence: The Future of Humankind*, p. 5.

Vinge, V. (1993, Dec 1). The Coming Technological Singularity: How to Survive in the Post- Human Era. *NASA CP-10129.* Cleveland.

*World Bridge Games Makes an Impressive Debut*. (2008, October). Retrieved from 1st World Mind Sports Games: http://db.worldbridge.org/Repository/tourn/Beijing.08/Beijing.htm
