import React, { useMemo, useState } from 'react';
import { transformSource } from './utils';
import type { IDataset, ILayer, ILayerType, PropsType } from '../../typings';
import type { ISourceOptions } from '@antv/l7-react/es/component/LayerAttribute';
import {
  HeatmapLayer,
  LineLayer,
  PointLayer,
  PolygonLayer,
} from '@antv/l7-react';
import type { ILayerProps } from '@antv/l7-react/lib/component/LayerAttribute';
import ErrorBoundary from '../ErrorBoundary';
import { featureCollection } from '@turf/turf';
import { useDebounceEffect } from 'ahooks';

export interface ILayerConfig {
  layer: ILayer;
  dataset: IDataset;
  data: any[];
}

interface IProps {
  config: ILayerConfig;
  event: JSX.Element;
  propsList: PropsType[];
}

const LAYER_COMPONENT_MAP: Record<
  ILayerType,
  React.NamedExoticComponent<ILayerProps> | undefined
> = {
  point: PointLayer,
  line: LineLayer,
  polygon: PolygonLayer,
  trip: LineLayer,
  hex: PolygonLayer,
  heat: HeatmapLayer,
};

function getLayerKey(layer: ILayer, index: number) {
  const {
    id,
    config: { opacity },
  } = layer;
  if (layer.type === 'line') {
    return `${id}+${index}-${layer.config.lineType}-${opacity}`;
  }

  if (layer.type === 'point') {
    return `${id}+${index}-${layer.config.shape}`;
  }

  if (layer.type === 'heat') {
    return `${id}+${index}-${layer.config.shape}`;
  }
  return `${id}-${index}-${opacity}`;
}

const LayerItem: React.FC<IProps> = React.memo(
  ({ config, event, propsList }) => {
    const { layer, data } = config;

    const [source, setSource] = useState<ISourceOptions>({
      data: featureCollection([]),
    });
    const [isFirstLoaded, setIsFirstLoaded] = useState(false);

    useDebounceEffect(
      () => {
        setSource(transformSource(layer, data));
      },
      [data, JSON.stringify(layer)],
      {
        wait: 200,
      },
    );

    const LayerComponent = useMemo(() => {
      return LAYER_COMPONENT_MAP[layer.type];
    }, [layer.type]);

    return (
      <>
        {propsList?.map((props, propsIndex) => {
          const key = getLayerKey(layer, propsIndex);
          return (
            <ErrorBoundary key={key}>
              {/* in case we accidentally remove a layer */}
              {LayerComponent && source.data.features.length ? (
                <LayerComponent
                  key={getLayerKey(layer, propsIndex) + '-layer'}
                  {...props}
                  source={source}
                  onLayerLoaded={(layer) => {
                    if (!isFirstLoaded) {
                      layer.fitBounds();
                      setIsFirstLoaded(true);
                    }
                  }}
                >
                  {event}
                </LayerComponent>
              ) : null}
            </ErrorBoundary>
          );
        })}
      </>
    );
  },
);

export default LayerItem;
