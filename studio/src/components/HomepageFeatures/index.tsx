import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'End-to-End Machine Learning Workflow',
    // Replace with your own image or remove the `Svg` prop if not needed.
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Studio.AI guides you through an entire pipeline: from data preparation and image
        tiling, to annotation, training, and model application. This end-to-end approach
        ensures you gain a comprehensive understanding of AI-driven microscopy workflows.
      </>
    ),
  },
  {
    title: 'Educational Value',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Designed with learning in mind, Studio.AI helps students and researchers
        bridge theoretical knowledge with practical, real-world machine learning
        applications for microscopy image analysis.
      </>
    ),
  },
  {
    title: 'Powerful Infrastructure',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Built on modern technologies, Studio.AI leverages GPU acceleration, advanced
        segmentation models, and distributed processing to handle large datasets and
        deliver scalable, efficient performance.
      </>
    ),
  },
  {
    title: 'Flexible and Modular',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Each phase of the workflow—tiling, annotation, training, and analysis—can be
        customized or extended. Use only the components you need, or follow the
        entire pipeline to get the most complete experience.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
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
