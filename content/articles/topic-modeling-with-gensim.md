+++
date = '2017-03-26'
draft = false
title = 'Topic modeling with Gensim'
description = 'Like unlocking hidden themes in a great novel, topic modeling unveils the unspoken threads in vast datasets. From scikit-learn’s reliable tools to gensim’s transformative power, join a journey into the art of teaching machines to understand text.'
keywords = ['gensim', 'topic-modeling']
tags = ['gensim', 'NLP', 'topic-modeling']
categories = ['aiml']
+++

I first started doing topic modeling when I used to play around with the [nips dataset][nips]. The first time I tried it, I used scikit-learn for this. I used LDA and NMF for this, and I received results that I was happy with. In this way, I think [scikit-learn][sklearn] is one of the most appropriate tools available for exploratory data science tasks. But I had bigger plans, of tackling even bigger datasets. Then I got introduced to another python library [gensim][gensim] which is focused on topic modeling. Among many features it provides, it includes transformations such as _online_ LDA, LSA and HDP, and wrappers to other popular libraries like scikit-learn, [vowpal wabbit][vowpal_wabbit], and [Mallet][mallet].

The code can be viewed at my [Github repository][gh_repo].

<!--more-->

While numpy and scipy comes along with gensim when you install it via `pip install -U gensim`, having [nltk][nltk] installed also might come in handy if you decide to perform lemmatization or stemming. Gensim does provide Porter stemming but nltk does provide many other features as well. It is also recommended to have a blas/laplack library such as [OpenBlas][OpenBlas], [Atlas][Atlas] or [intel MKL][intel_mkl].

## Twenty Newsgroup

I started out experiments on gensim with the [20 newsgroup dataset][20ng], which is a collection of around 20,000 mails from different subscriptions. They will contain email headers, which can be stripped in your pre-processing. These 20 newgroup emails will be present in 20 folders, so you will have to do a directory walk and process each email. Once your pre-processing, that may involve lemmatization, stemming and stop-word removal, is complete you can provide the document or in this case emails to gensim, to be converted to bag-of-words representation. The resulting corpus you create can be "streamed" to subsequent gensim transformations, which just means gensim will work on documents one-by-one. This is memory efficient and means that you can perform topic modeling on large datasets like Wikipedia dump, on an average machine. The whole folder will be around 47 MB and this is a relatively
very small dataset.

Below is a bare-bones version of code for pre-processing your data:

```python
import os
import logging
import gensim
from gensim.utils import tokenize
from gensim.corpora import Dictionary
from nltk.corpus import stopwords
from itertools import dropwhile

logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)

""" iterate through directories by a walk"""
def iter_docs(topdir, stoplist):
    for root, subdirs, files in os.walk(topdir):
        for filename in files:
            file_path = os.path.join(root, filename)
            fin = open(file_path, 'rb')
            str_list = []
            for line in dropwhile(isHeader, fin):
               str_list.append(line)
            text = ''.join(str_list)
            fin.close()
            yield (x for x in gensim.utils.tokenize(text, lowercase=True, deacc=True, errors="ignore")
                                                    if x not in stoplist)

class OnlineCorpus(object):

    def __init__(self, topdir, stoplist):
        self.topdir = topdir
        self.stoplist = stoplist
        self.dictionary = Dictionary(iter_docs(topdir,stoplist))

    def __iter__(self):
        for tokens in iter_docs(self.topdir, self.stoplist):
            yield self.dictionary.doc2bow(tokens)

TEXTS_DIR = "../Data/20_newsgroups"
MODELS_DIR = "../Data/models"
stoplist = set(stopwords.words("english"))

corpus = OnlineCorpus(TEXTS_DIR, stoplist)
corpus.dictionary.save(os.path.join(MODELS_DIR, 'twentyNewsGroup.dict'))
gensim.corpora.MmCorpus.serialize(os.path.join(MODELS_DIR, 'corpora.mm'), corpus)
```

It is also trivial to provide gensim's methods with a corpus that has been tf-idf transformed. Do note that, in case you hold out some of your dataset for later, you will have to do the same transformations you did on the training data, otherwise the results might end up bad.

Gensim also provides algorithms that will utilize multiple cores in your machine to be more efficient. There is also a distributed implementation of LDA and LSA that gensim provides which is very useful while dealing with very big datasets. While I have created a [jupyter notebook][20ng_jupyter] that benchmarks the performance of gensim's methods, do note that much newer versions of gensim would have better performance.

The below code is a bare-bones code for gensim after you have completed pre-processing:

```python {id="run" lineNos=inline tabWidth=4}
import os
from gensim import corpora, models

MODELS_DIR = "../Data/models"
num_topics = 10
dictionary = corpora.Dictionary.load(os.path.join(MODELS_DIR,'twentyNewsGroup.dict'))
corpus = corpora.MmCorpus(os.path.join(MODELS_DIR, 'corpora.mm'))
lda = models.LdaModel(corpus=corpus, id2word=dictionary, num_topics=num_topics)
lda.print_topics(num_topics=num_topics, num_words=10)
lda.save(os.path.join(MODELS_DIR, 'twentyNewsGroups.lda'))
```

## Enron dataset

Once I started benchmarking the performance of gensim on the twenty newsgroup dataset I realized that there is not enough data to see a clear distinction between the two, and what I really wanted to know was how they would perform when dealing with a bigger dataset. For this reason, I next tried my hand on the [Enron dataset][enron], which is a dataset containing around 500,000 emails between employees of Enron, before it went bankrupt.

One of the earliest gripes I had with gensim was that it did not have enough documentation in my opinion. While trying to figure out how some methods worked, by reading the source code from [gensim's Github repository][gensim_ghrepo], I discovered a folder containing many jupyter notebooks that demonstrated many recipes. Apart from this, the [google group][gensim_ggroup] is also active and the posts there would also give you directions.

Overall I would say, gensim's usage has increased and it has continued bringing more and more useful functionalities, to the board. I have noticed that gensim's performance does _not increase as much as one would expect_ even if we provide more cores or more machines to the algorithm. I am expecting this to be fixed soon by the developers as they continue to optimize the code. Another thing I have noted is the effectiveness of the random state. I am expecting that by providing the same random state to the LDA, provided every other parameter remains the same, I would be getting back the same model. As far as I can see, this is not happening.

## Recommended reading

- [An introduction to LDA][LDA_EChen]
- [gensim's jupyter docs that cover important points][gensim_jupyter]

[nips]: https://www.kaggle.com/benhamner/nips-papers
[sklearn]: http://scikit-learn.org/stable/
[gensim]: https://radimrehurek.com/gensim/index.html
[vowpal_wabbit]: http://hunch.net/~vw/
[mallet]: http://mallet.cs.umass.edu/
[gh_repo]: https://github.com/krispingal/topic_modeling
[nltk]: http://www.nltk.org/
[OpenBlas]: http://www.openblas.net/
[Atlas]: http://math-atlas.sourceforge.net/
[intel_mkl]: https://software.intel.com/en-us/intel-mkl
[20ng]: https://archive.ics.uci.edu/ml/datasets/Twenty+Newsgroups
[20ng_jupyter]: https://github.com/krispingal/topic_modeling/blob/master/20_newsgroup/lda_benchmark_20ng.ipynb
[enron]: https://www.kaggle.com/wcukierski/enron-email-dataset
[gensim_ghrepo]: https://github.com/RaRe-Technologies/gensim
[gensim_ggroup]: https://groups.google.com/forum/#!forum/gensim
[LDA_EChen]: http://blog.echen.me/2011/08/22/introduction-to-latent-dirichlet-allocation/
[gensim_jupyter]: https://github.com/RaRe-Technologies/gensim/tree/develop/docs/notebooks
