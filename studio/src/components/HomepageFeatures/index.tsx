import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  imagePath: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'End-to-End Machine Learning Workflow',
    imagePath: '/img/End-to-End.jpg',
    description: (
      <>
        Studio guides you through an entire pipeline: from data preparation and image
        tiling, to annotation, training, and model application. This end-to-end approach
        ensures you gain a comprehensive understanding of AI-driven microscopy workflows.
      </>
    ),
  },
  {
    title: 'Educational Value',
    imagePath: '/img/educational-value.jpg',
    description: (
      <>
        Designed with learning in mind, Studio helps students and researchers
        bridge theoretical knowledge with practical, real-world machine learning
        applications for microscopy image analysis.
      </>
    ),
  },
  {
    title: 'Powerful Infrastructure',
    imagePath: '/img/modular.jpg',
    description: (
      <>
        Built on modern technologies, Studio leverages GPU acceleration, advanced
        segmentation models, and distributed processing to handle large datasets and
        deliver scalable, efficient performance.
      </>
    ),
  },
  {
    title: 'Flexible and Modular',
    imagePath: '/img/flexible.jpg',
    description: (
      <>
        Each phase of the workflow—tiling, annotation, training, and analysis—can be
        customized or extended. Use only the components you need, or follow the
        entire pipeline to get the most complete experience.
      </>
    ),
  },
];

function Feature({title, imagePath, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img 
          src={imagePath} 
          alt={title} 
          className={styles.featureSvg} 
          role="img" 
        />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}