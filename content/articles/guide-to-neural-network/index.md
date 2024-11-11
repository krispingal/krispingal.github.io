+++
date = '2018-11-04'
draft = false
title = 'A guide to Neural Networks'
description = 'A guide to neural networks'
keywords = ['neural networks']
images = ['nn.webp', 'neuron.webp']
tags = ['neural networks']
math = true
+++

{{< figure src="nn.webp" title="Neural Network architecture" caption="Fig 1. Neural net with Input layer &#x2208; &#8477;<sup>16</sup>; hidden layer 1  &#x2208; &#8477;<sup>12</sup>; hidden layer 2 &#x2208; &#8477;<sup>10</sup> and finally a single unit &#x2208; &#8477; in the output layer" loading="lazy" >}}

> TLDR:
> Neural Networks are computational models that stacks units called neurons into layers to create predictions after we have trained the network. Each unit performs a linear transformation on the data followed by a non-linear transformation to produce a result. Forward propagation computes the network result and backward propagation computes the changes in weights and biases for the network in subsequent epochs. The non-linear activation function supports the network to assume any mathematical function, this is called the Universal Approximation theorem.

## Introduction

Every day we are relying on machine learning models to make our lives simpler and hassle-free. Take your average day, where you start, by reading news and weather predictions, or later in the day when you are checking your emails, we unconsciously are relying on machine learning models that run behind the scenes. The list goes on and on with applications in image recognition used in our gallery, audio recognition in voice assistants. This list keeps growing every day.

A few popular classical Machine learning models include Logistic Regression, Linear Regression, Decision Trees, Support Vector Machines, and Naive Bayes models. Although these models are nowadays less commonly used in practice, they are still very useful as understanding them helps to understand the more recent models. Ensemble models such as Random forests and XGBoost are some machine learning models that are commonly used these days.

<!--more-->

---

## What are Neural Networks?

Neural Networks are a class of Machine learning models that are different from the ones we saw above. They emerged from the pursuit of building systems that imitate human thought. Though these were originally conceived in the sixties, interest surrounding them died during the nineties when they were not producing impressive results. Interest in Neural Networks have risen to new heights after the 2010s when they have beat benchmarks in various tasks like image recognition and natural language processing, currently, there are models which beats human performance in specific tasks. Deep learning has become an important toolset in the data science toolbox. It has made its way into image recognition, speech recognition, natural language processing, and regular prediction tasks. These models started performing quite well, once we started feeding in _more data and computational power_. Improvements and breakthroughs in both these have aided in deep learning becoming more successful in various applications, especially with the rise in usage of GPUs.

To understand what's happening behind the scenes, let's take the problem of classification. Our input $x$ is a n &times; m matrix, with n training samples of dimensionality m. The labels for this training data will be $y$.

Let's understand our "network" as well. Our Neural network comprises of layers of neurons or units. Each neuron has a weight vector associated with it and a bias value. Conceptually data flows/passes through each layer of the network and then arrives at the output layer where you get the prediction of the network. During the training cycle, there are two crucial steps called _forward propagation_ and _backward propagation_.

### Forward propagation

Once we have this data setup, we perform what is called a **forward propagation**. During the forward propagation, the training data passes through all the layers. In the forward propagation, we pass the data to our network. Once our data gets passed to our network of units, we perform a series of computations in each layer and "propagate" the results to the next layer. If we take an individual unit, what happens is first we perform a **linear transformation** as given in Eq([1](#eqn1_2)). In the equation, $W$ is the weight matrix and $b$ is the bias vector. After we get $z$, we apply the **activation function** and compute $a$ as per Eq([2](#eqn1_2)).

<div id="eqn1_2" class="eqn-wrapper">
\\[
\begin{align}
z &= W \cdot x + b \tag{1} \\
a &= \sigma (z) \tag{2}
\end{align}
\\]
</div>

Activation functions are non-linear functions, for example sigmoid function or tanh function or softmax function. The choice of non-linear function is dependent on the properties we desire; a sigmoid function, see Eq([3](#eqn3_4)), will squeeze outputs to the range of [0,1], this activation function is typically used at the output layer of a binary classification model. Tanh function, see Eq([4](#eqn3_4)), outputs in the range of [-1, 1]. Softmax activations are typically used in the output layer of a multiclass classification problem. Modern neural architectures commonly use a few other activation functions such as <abbr title="Rectified Linear Unit">ReLU</abbr>, leaky ReLU, GELU, ... in addition to the 3, we discussed earlier.

<div id="eqn3_4" class="eqn-wrapper">
\\[
\begin{align}
\sigma(x) &= \frac{1}{1 + e^{-x}} \tag{3} \\
tanh(x) &= \frac{e^{2x}-1}{e^{2x}+1} \tag{4}
\end{align}
\\]
</div>

Figure 2 shows the above logic pictorially.

{{< figure src="neuron.webp" title="Single Neuron" caption="Fig 2. A single unit taking input <i>x</i> &#x2208; &#8477;<sup>3</sup> and returning output <i>y</i> &#x2208; &#8477;" loading="lazy" >}}

We have seen what happens in the forward propagation for a single unit but in layer _k_ we have <i>n<sup>out</sup></i> units. Matrix operations are faster than regular loop operations, so we transform our problem such that we have matrix multiplications and additions.

Let's formalize; Our neural network comprises of _L_ layers. Each layer has a Weight matrix $W$ &#x2208; &#8477;<sup>[n_out &times; n_in]</sup> where _n_out_ is the number of units in layer _l_ and _n_in_ is the number of units in layer _l-1_. Bias $b$ &#x2208; &#8477;<sup>[n_out]</sup> will be a vector. We can see that equations 1 & 3 still hold, with minor modifications to our implementation logic we can make things work. For now, let's assume that we initialize $W$ matrix and $b$ vector with numbers drawn from a normal distribution. Once the forward propagation reaches the output layer we obtain the output for the set of training data we provided.

### Backward propagation

The output the network produces $\hat y$ after the forward propagation at this point need not be anywhere close to the actual $y$, after all, we did not have any constraints during the forward propagation. This is where backward propagation comes in. During the training cycle, we have both the actual label $y$ and the predicted label $\hat y$ for a given sample. With these two, we can calculate the **loss** which is a measure of how distant our predictions are from the true values. For the problem of classification _cross-entropy_, see Eq([5](#eqn5)), is generally a good choice, while something like <abbr title="Root Mean Square Error">RMSE</abbr> is a good choice for regression problems.

<div id="eqn5" class="eqn-wrapper">
\\[
\begin{align}
Loss_{cross-entropy} = \frac{-1}{m}\sum_{i=1}^{m} \sum_{k=0}^{K} I \{y^{(i)} = k\}\text{log}\, a_{k}^{(i)} \tag{5}
\end{align}
\\]
</div>

The loss function of these networks can be conceptually similar to the landscape of a valley. Our objective is to find the lowest point in this valley, which translates to us finding the function that captured all the characteristics of the given data. Since we do not know the true form of the function that generated our training data, we employ a technique called [gradient descent][gradient_descent]. When we compute the gradient of a function, we get the direction of the maximal slope. So to reach a minima we simply need to go the opposite direction (or negative direction) of the gradient.

Our loss function can be expressed as a function of the weights and biases of a particular layer. We would be finding the gradient of this function and then moving in the direction of the minima. We will first be computing this negative gradient of loss w.r.t the output layer. Once we have this we can "propagate" these results to the layers preceding the output layer to find the directions each weight vector/matrix and bias value/vector needs to update so that we can move towards the minima.

### Tying everything together

When we provide a bunch of training data to the network, after the forward propagation we get the predictions the model made. Next, we compute the gradients of all the weight matrices and bias vectors during the backward propagation. Once we compute the gradient for the loss function $J$ we update the parameter &#952; according to Eq([6](#eqn6)). &#945; here is the **learning rate** which is one of the most important hyperparameters that we have to set. If we use a high learning rate we would miss the minima, while if we use too low of a learning rate we could get stuck at some local minima. A "good" learning rate would ensure that our model reaches the minima relatively quickly. Modern neural networks can work with adaptive learning rates.

<div id="eqn6" class="eqn-wrapper">
\\[
\begin{equation}
\theta_{new} = \theta - \alpha \cdot \nabla J(\theta) \tag{6}
\end{equation}
\\]
</div>

During the training phase, our network will see all the training data and try to reach the optima using gradient descent. If we have lots of training data (> 1 million records) it might be hard to fit all this data into memory during gradient descent. More commonly we would employ something called _mini-batch gradient descent_, which will look at a batch of training data to "guess" the true gradient. As the batch size increases decrease in loss becomes smoother and approaches the value we might get using the full gradient descent. After we see a mini-batch we use the updated parameters to do another mini-batch gradient descent following Eq([6](#eqn6)), until the network, sees all the training data. We say that our network completed one _epoch_ after the network has seen all the training data. Practitioners train their model until some certain criteria that are important for that specific problem are met.

## Why do neural networks work?

Neural networks could be equated to the [perceptron][perceptron] model with hidden layers and non-linear activation functions. Let's explore both these and see why adding these two provides a much powerful model.

When we have multiple layers in the neural network, what we are doing is that we are stacking linear transformations followed by a non-linear function. If we are only stacking linear transformations, we can reduce this into a single linear transformation. Stacking both the linear and non-linear function together allows us to construct _approximately_ any mathematical function that we desire. We call this property the **Universal approximation theorem**. A good read-up that covers a visual proof for this as well as the surrounding caveats for this is present in Michael Nielsen's [online book][universal_approx_thm].

{{< figure src="scatter_plot.webp" title="Single Neuron" caption="Fig 3. A concentric data problem to classify the points, a linear classifier such as SVM (without kernel) would not be able to distinguish the points properly in such cases." loading="lazy" >}}


So how does a neural network partition the data in a classification problem? Neural networks transform the feature space into space where we can distinguish each data point using a hyperplane. Figure 3 shows a toy problem of identifying the two classes when data is spread concentrically. One way to solve this is to warp this space into a bowl-shaped space and then use hyperplane to partition this space.

{{< figure src="bowl_shaped.webp" title="Bowl shaped 3 D space" caption="Fig 4. Bowl shaped 3-D space where we can easily partition the data points and space shown in Fig 3. using a plane" loading="lazy" >}}

---

## Why would one use neural networks or why not use it?

There are no "cure-all" solutions, each model has it's own strengths and it's own weaknesses. Let's try to explore the strengths of neural networks and why they are a popular model nowadays.

### No more Feature Engineering

In regular Machine learning techniques, one is provided hundreds of features, of which many are redundant or not useful. Feature engineering used to be an art and having domain knowledge was a prerequisite for creating an effective model. This is the key difference between classical Machine Learning and neural networks. For neural networks to work well, you don't need to do much of feature engineering, the networks would learn which features are relevant and which are not by themselves. This allows people who do not get assistance from subject-matter experts to also create very effective models.

### Decoupling Bias and Variance

In classical machine learning we learn about the [bias variance tradeoff][bias_var]
curve and how we need to find the sweet spot that gets our model the best performance. In neural networks, however, we can decouple bias and variance and try to individually solve them. For instance, if our network has high bias we can just add more layers and units to our network. We can also add dropouts and l1/l2 regularization to the weights as well to counter high variance.

Now let's look at reasons why one might not use a neural network.

### Weaknesses of neural networks

It used to be the case that if you did not have _massive amounts of data_ then training a good is not possible. But these days for many problems we can utilize [transfer learning][transfer_learning]. In other scenarios, we might be able to generate more training samples using generative models. But if there are no transferable models available and the problem at hand is difficult, we might need lots of data.

If we are building a deep neural network and training the full model, chances are high that we would need _lots of computing resources_ - GPU, and RAM. Although these days there are very cost-effective solutions for obtaining such computational resources. For personal use, Google Colab and Kaggle kernels are available for free; while for commercial purposes there are multiple options available in Amazon AWS and Microsoft Azure.

In certain studies, _reproducibility_ is a key characteristic that researchers use to weigh the study along with the results it brings. Earlier it used to be quite difficult to exactly reproduce the results of a paper if we are using libraries. When we train a neural network, during initialization we are initializing a lot of parameters including Weight matrices, biases, and a few other parameters randomly. Although modern deep learning libraries do give the capability of setting pseudo-random number seeds, the user has to take some effort to maintain reproducibility.

Neural networks had been characterized as "black-boxes" for a long time. Although this is slightly changing with more explainable models and visualizing what the layers are learning, these techniques are yet to be a common-place in industry.

Finally, we have to deal with the _complexity of setting up neural networks_ themselves. To get a really "good" neural network one needs to tune multiple hyperparameters. In addition to the number of hyperparameters, they could also take a wide range of values which makes hyperparameter tuning a pain. Although there are hundreds of hyperparameters available to tune in a network, in reality only tuning a handful of hyperparameters can result in training a good network. We can also use [Bayesian Optimization][bayes_optimiz] using Gaussian Process to perform hyperparameter tuning which is more effective than a randomized grid search or a regular grid search.

---

## Different types of Neural Networks

Although the neural networks we had seen so far are the ones people most identify when talking about neural networks, there are variants of this available. _[Convolutional Neural Networks][CNN]_(CNN) are some of the most widely used neural networks and machine learning models in general. They work well in identifying spatial patterns, hence have been used in image recognition tasks. In a few difficult tasks such as imagenet, state of the art models have beaten human-level accuracies.

Another popular variant of the neural network is the _[Recurrent Neural Network][RNN]_(RNN). RNNs work well with sequential data and as such has been employed in Natural Language Processing (NLP) tasks and audio-related tasks as well.

## Getting started with Neural Networks and deep learning

### Resources

If all the above was very vague for you &#x28;don't worry, it is&#x29;, there are a few resources that I think are good and are worth checking out;

- Andrew Ng's [Deeplearning.ai][deeplearning.ai]
- Jeremy Howard & Rachel Thomas's [Fast.ai][fast.ai]
- Stanford's [CS231N][cs231n]
- Michael Nielsen's online [Deep learning book][deep_learning_book].

There are quite a few people who post stuff on twitter, so following people on twitter is also very helpful.

### Toy problems

There are quite a few toy problems available for testing out what you learned in Machine Learning and Deep Learning. [Kaggle][kaggle] has quite a few playground competitions where there is a leaderboard to see how well your model is doing compared to others. If you get stuck somewhere or if you are looking for some ideas, these competitions have very active forums, so you can head over there. They also make the datasets available for past competitions which is nice.

If kaggle competitions or others like kaggle is not your thing for starting out, you can look at the following problems:

- [MNIST][MNIST]
- [IMDB sentiment analysis][imdb]
- [Kaggle datasets][kaggle_ds]
- [Lionbridge datasets][lionbridge_ds]

The [MNIST][MNIST] dataset is a well-studied dataset that is almost always the first task one would try to solve using deep learning. It is a dataset that contains handwritten numbers from 0 to 9. Almost all deep learning architectures would get benchmarked on this dataset. State of the art architectures has reached the upper 99 percent in terms of accuracy. All these reasons together with the fact that it is small enough that you can run your model quite fast, makes it an ideal candidate dataset for people starting in deep learning. My objective was to learn the effects of tweaking various parameters of a neural network. My work can be viewed [here][github_url].

### Deep Learning Libraries

There are quite a few deep learning libraries that have emerged. Some of the popular ones include [Tensorflow][tensorflow_url], [Theano][theano_url], [Torch][torch_url], and [Pytorch][pytorch_url]. [Keras][keras_url] is also another popular deep learning library, which is a high-level one that sits on top of a library such as Tensorflow and Theano. As of 2017 Keras has been integrated into Tensorflow, allowing us to use the simpler UI to create networks. _Tensorflow-Keras_ is more favored in industry when you need your model to be fast and run on mobiles as well. _Pytorch_ is another popular open-source machine learning library in python that is more adopted in academia because it allows a lot of flexibility. Both of these libraries are well documented and have numerous tutorials online.

[gradient_descent]: https://en.wikipedia.org/wiki/Gradient_descent
[perceptron]: https://en.wikipedia.org/wiki/Perceptron
[universal_approx_thm]: http://neuralnetworksanddeeplearning.com/chap4.html
[bias_var]: https://en.wikipedia.org/wiki/Bias%E2%80%93variance_tradeoff
[transfer_learning]: https://ruder.io/transfer-learning/
[bayes_optimiz]: https://www.cs.cornell.edu/courses/cs4780/2018fa/lectures/lecturenote15.html
[CNN]: https://cs231n.github.io/convolutional-networks/#conv
[RNN]: https://en.wikipedia.org/wiki/Recurrent_neural_network
[iris]: https://www.kaggle.com/uciml/iris
[deeplearning.ai]: https://www.deeplearning.ai/
[fast.ai]: https://www.fast.ai/
[cs231n]: https://cs231n.stanford.edu/
[deep_learning_book]: http://neuralnetworksanddeeplearning.com/
[MNIST]: http://yann.lecun.com/exdb/mnist/
[imdb]: https://ai.stanford.edu/~amaas/data/sentiment/
[kaggle]: https://www.kaggle.com/
[kaggle_ds]: https://www.kaggle.com/datasets
[lionbridge_ds]: https://lionbridge.ai/datasets/
[github_url]: https://github.com/krispingal/Image-classification/blob/master/MNIST_pytorch.ipynb
[tensorflow_url]: https://www.tensorflow.org/
[theano_url]: http://deeplearning.net/software/theano/
[torch_url]: http://torch.ch/
[pytorch_url]: https://pytorch.org/
[keras_url]: https://keras.io/
