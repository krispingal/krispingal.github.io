+++
date = 2016-08-24T04:14:54-08:00
draft = false
title = 'Shelter Animal Outcomes'
description = 'How do you predict the life paths of cats and dogs in shelters? This journey takes you through Kaggle’s shelter animal outcomes competition, from feature engineering to parameter tuning, with lessons learned at every step.'
keywords = ['kaggle']
categories = ['aiml']
images = ['puppy.webp']
[params]
  math = true
+++

{{< figure src="puppy.webp" title="A puppy taken in at a shelter" attr="Picture taken from SOS" attrlink="https://www.flickr.com/photos/pifaslt/" loading="lazy" >}}


[Shelter animal outcomes][animal-shelter-outcomes] is a knowledge
competition hosted by [kaggle][kaggle]. My goal was to learn and get
familiarized with the different techniques, methods and tools required to
solve classification problems. Throughout this journey, I utilized [pandas][pandas],
[matplotlib][matplotlib], [seaborn][seaborn], [jupyter][jupyter] and
[scikit-learn][scikit-learn]. The goal of this competition
is to predict the outcome of a cat or a dog, based on its age, gender(also
whether spayed/neutered or not), breed, color. The outcomes are
return-to-owner, adoption, transfer, euthanasia and died. In some cases
we are provided with outcome subtypes too.

All my work related to this can be found in this
[github repository][repo_url], it houses my jupyter notebooks.

<!--more-->

# Prior beliefs

Before looking at the competition data, I thought cats might be a bit
more favored than dogs, because of seeing many cat memes & gifs. I
thought the following factors to influence the outcome of an animal,
in descending order of importance.

1. cat/dog
2. age
3. breed
4. color
5. gender

# The data

The training set had the following features:

- AnimalType : Cat/Dog
- AgeUponOutcome : age
- Breed
- SexUponOutcome : gender + spayed/neutered/intact
- Color
- DateTime
- Name
- _OutcomeType_ [Adoption, Transfer, Euthanasia, Death & Return to owner] &
- OutcomeSubtype [Foster, Partner, Surgery, Suffering ...]

The test data does not include the last two columns.
Perhaps OutcomeSubtype column was just provided to satisfy the participant's curiosity.

# Model creation

To reach my objective, to learn about various methods and techniques to solve similar problems,
I planned to start off with the simplest models then progressively fine tune it. In all I made three
passes and learned new things in every one of them.

I used the following algorithms for my models:

1. Random Forests
2. Logistic Regression
3. Naive Bayes
4. Decision Tree
5. SVM
6. KNN
7. Extra Trees Classifier
8. AdaBoost
9. GradientTreeBoosting
10. and Bagging.

---

# First pass

I started off by doing a bit of visualization. The visualization gave me
some knowledge on how the data is spread and what features might be
important. Next I did a crude feature manipulation and feature selection
to finally get the following features: `AnimalType`, `AgeInDays`,
`Sex+Neutered`, `HasName`. This data was fed into Scikit-learn's algorithms 
to generate predictions. I tried to use as many algorithms I
could but the evaluation metric log loss would need to get probability
confidence for each outcome.

\\[
\text{log loss} = -\frac{1}{N}\sum\_{i=1}^{N} \sum\_{j=1}^{M} y\_{ij}\log(p\_{ij}) \tag{1}
\\]

Apart from using the score which Kaggle provides, I used cross-validation
to get an estimate on how well the models are doing. 
The results of this initial pass were satisfactory for a first attempt.

Key learning point for me from the first pass was, I got familiar
with scikit-learn's api for classification tasks as well as
cross-validation.

---

# Second pass

This time when I browsed through the forums for this competition, I
found out a [post][kaggle_post] which talked out about a potential data
leak. This made me realize that features like AgeUponOutcome, DateTime
are actually data leaks and should not be used in the model. Hence I
decided to do a better feature transformation or data cleaning this
time, which would not include any data leaks. I decided to keep a
feature about gender + neutered or not, because the animal can be
spayed/neutered if the new owners request for it(in case of adoption or
fostering).

Finally I ended up with the following features:

- `NameLength`,
- `IsMix`,
- `CoatType`(short/medium/long hair),
- `IsDangerous`(pit bull or other dangerous dogs),
- Gender + spayed/neutered,
- Ancestor1_group and Ancestor2_group.

The Ancestor_group features are for dogs, where dog breeds are
classified into groups like sporting, herding, hound, working etc.
I got this idea from another [post][kaggle_dog_group_post] in the forum.

Apart from the above changes in feature transformation, in the second
pass I made additional changes to do feature selection as well. Wherever
possible I tried using scikit-learn's RFECV(Recursive Feature Elimination
with Cross Validation). It is not always the best method for feature
selection though. With algorithms where RFECV won't work I used
univariate feature elimination. For some classifiers I used pipelines
which pipe feature selection with the classification algorithms.

I did notice most _classifiers were not doing as well as it did during the
first pass_, probably because I removed the Age feature which should
have been a feature that played a crucial role of the outcome of an
animal.

Key learning points in this pass was learning about Feature selection and
pipelines.

---

# Third pass

For the third and final pass my aim was to tune the classifiers with
their key parameters to achieve the best scores. For this I used
scikit-learn's _GridSearchCV_. Essentially you give a parameter or a list
of parameters and the list of values these can take, then internally it
will do a search over all the given parameters, and finally it will give
you the combination which gives the best score. As you can imagine this
is a computationally intensive operation.

For certain classifiers, like SVM and GradientTreeBoosting classsifiers,
GridSearchCV even running on multiple cores could take hours to complete.
In these cases I used the alternative _RandomizedSearchCV_, in which you
can specify how many iterations it should perform. One can also provide
random numbers from a range, for these parameters. Hence if you have low
computational resources and want a solution which is good but not the best,  
in limited time, this is a good solution, if you set low number of
iterations. RandomizedSearchCV can also be used if you have ample 
computational resources and no time restrictions to iterate
through many parameters that you might not want to list down. The
drawback for RandomizedSearchCV is you might repeat an iteration with a
set of parameters that might have already been tried.

Key learning points were learning about GridSearchCV and
RandomizedSearchCV. One thing I learned afterwards was that, _in practice
GridSearchCV is only provided the parameters that are deemed important
for that classifier_.

---

# Conclusion

For me this project, when considering everything has been highly rewarding.
I got familiar with tools like pandas and scikit-learn. I also got to
learn about how to use apply techniques like feature selection and
parameter tuning.

I knew that I could have obtained better kaggle score if I exploited
some data leaks, or used outside data to train a better classifier. I
believed that these activities were not with the spirit of the
competition nor do they take me closer to my objective, so I did not
spend time pursuing these paths.

I also got to learn more about cats and dogs, which dispelled some of the
presumptions I held in my mind.

> P.S.: This post and related work are dedicated to my family's cat, who passed away on August 20.

[animal-shelter-outcomes]: https://www.kaggle.com/c/shelter-animal-outcomes
[kaggle]: https://www.kaggle.com/
[pandas]: http://pandas.pydata.org/
[matplotlib]: http://matplotlib.org/
[seaborn]: https://stanford.edu/~mwaskom/software/seaborn/index.html
[jupyter]: http://jupyter.org/
[scikit-learn]: http://scikit-learn.org/stable/index.html
[sos-animals]: https://www.flickr.com/photos/pifaslt/
[repo_url]: https://github.com/krispingal/shelterAnimalOutcomes
[kaggle_post]: https://www.kaggle.com/c/shelter-animal-outcomes/forums/t/22119/cheating-your-way-to-the-top-of-the-lb-remove-the-lb
[kaggle_dog_group_post]: https://www.kaggle.com/andraszsom/shelter-animal-outcomes/dog-breeds-dog-groups/discussion
