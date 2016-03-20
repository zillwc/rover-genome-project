# rover-genome-project
Distributed genetic algorithm to find an optimal rover design for Mars

Demo: http://zillwc.com:3000

Concept and physics credit goes to: http://boxcar2d.com/ and Box2D physics.
Project is a modification of boxcar2d, which was originally written by David Bau. Features added to original concept:

- **Distributed Design**: a winning design, based on fitness score, will be genetically mutated with other concurrent users' designs

- **Track Mutation**: along with the cars, the track itself will also be mutated (higher/steeper slopes, more jagged tracks) as the fitness score increases

- **Gravity**: scaled to match Mar's gravity (as cause, higher initial acceleration)

- **TTL**: cars' fitness scores will have varying deductions based on how long they take to reach distance

- **Increased camera spans**: during generation simulation, users can view their own active design simulation, as well as the design simulation of other users' designs.
