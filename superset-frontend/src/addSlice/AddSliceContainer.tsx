/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import Button from 'src/components/Button';
import { Select } from 'src/components';
import { css, styled, t, makeApi } from '@superset-ui/core';
import { FormLabel } from 'src/components/Form';

import VizTypeGallery, {
  MAX_ADVISABLE_VIZ_GALLERY_WIDTH,
} from 'src/explore/components/controls/VizTypeControl/VizTypeGallery';
import { number } from 'mathjs';

interface Datasource {
  label: string;
  value: string;
}

export type AddSliceContainerProps = {
  datasources: Datasource[];
};

export type AddSliceContainerState = {
  datasourceId?: string;
  datasourceType?: string;
  datasourceValue?: string;
  visType: string | null;
  datasets: [];
};

const ESTIMATED_NAV_HEIGHT = '56px';

const StyledContainer = styled.div`
  ${({ theme }) => `
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
    max-width: ${MAX_ADVISABLE_VIZ_GALLERY_WIDTH}px;
    max-height: calc(100vh - ${ESTIMATED_NAV_HEIGHT});
    border-radius: ${theme.gridUnit}px;
    background-color: ${theme.colors.grayscale.light5};
    margin-left: auto;
    margin-right: auto;
    padding-left: ${theme.gridUnit * 4}px;
    padding-right: ${theme.gridUnit * 4}px;
    padding-bottom: ${theme.gridUnit * 4}px;

    h3 {
      padding-bottom: ${theme.gridUnit * 3}px;
    }

    & .dataset {
      display: flex;
      flex-direction: row;
      align-items: center;

      & > div {
        min-width: 200px;
        width: 300px;
      }

      & > span {
        color: ${theme.colors.grayscale.light1};
        margin-left: ${theme.gridUnit * 4}px;
        margin-top: ${theme.gridUnit * 6}px;
      }
    }
  `}
`;

const cssStatic = css`
  flex: 0 0 auto;
`;

const StyledVizTypeGallery = styled(VizTypeGallery)`
  ${({ theme }) => `
    border: 1px solid ${theme.colors.grayscale.light2};
    border-radius: ${theme.gridUnit}px;
    margin: ${theme.gridUnit * 3}px 0px;
    flex: 1 1 auto;
  `}
`;

export default class AddSliceContainer extends React.PureComponent<
  AddSliceContainerProps,
  AddSliceContainerState
> {
  constructor(props: AddSliceContainerProps) {
    super(props);
    this.state = {
      visType: null,
      datasets: [],
    };

    this.changeDatasource = this.changeDatasource.bind(this);
    this.changeVisType = this.changeVisType.bind(this);
    this.gotoSlice = this.gotoSlice.bind(this);
    this.getDatasets = this.getDatasets.bind(this);
  }

  componentDidMount() {
    this.getDatasets();
  }

  exploreUrl() {
    const formData = encodeURIComponent(
      JSON.stringify({
        viz_type: this.state.visType,
        datasource: this.state.datasourceValue,
      }),
    );
    return `/superset/explore/?form_data=${formData}`;
  }

  gotoSlice() {
    window.location.href = this.exploreUrl();
  }

  changeDatasource(value: string) {
    this.setState({
      datasourceValue: `${value}__table`, // legacy formatting for datasourceIds
      datasourceId: value,
    });
  }

  changeVisType(visType: string | null) {
    this.setState({ visType });
  }

  isBtnDisabled() {
    return !(this.state.datasourceId && this.state.visType);
  }

  async getDatasets() {
    console.log('getting datasets');

    // const queryParams = rison.encode({
    //   filters: [
    //     {
    //       col: 'table_name',
    //       opr: 'ct',
    //       value: searchText,
    //     },
    //     {
    //       col: 'owners',
    //       opr: 'rel_m_m',
    //       value: userId,
    //     },
    //   ],
    //   order_column: 'changed_on_delta_humanized',
    //   order_direction: 'desc',
    // });
    const queryParams = '';

    const response = await makeApi({
      method: 'GET',
      endpoint: '/api/v1/dataset',
    })(`q=${queryParams}`);

    this.setState({ datasets: response.result });
  }

  render() {
    const { datasets } = this.state;
    const optionDatasets = datasets.map(
      (dataset: { id: number; table_name: string }) => ({
        value: dataset.id,
        label: dataset.table_name,
      }),
    );

    return (
      <StyledContainer>
        <h3 css={cssStatic}>{t('Create a new chart')}</h3>
        <div className="dataset">
          <Select
            autoFocus
            ariaLabel={t('Dataset')}
            name="select-datasource"
            header={<FormLabel required>{t('Choose a dataset')}</FormLabel>}
            onChange={this.changeDatasource}
            options={optionDatasets}
            placeholder={t('Choose a dataset')}
            showSearch
            value={this.state.datasourceValue}
          />
          <span>
            {t(
              'Instructions to add a dataset are available in the Superset tutorial.',
            )}{' '}
            <a
              href="https://superset.apache.org/docs/creating-charts-dashboards/first-dashboard#adding-a-new-table"
              rel="noopener noreferrer"
              target="_blank"
            >
              <i className="fa fa-external-link" />
            </a>
          </span>
        </div>
        <StyledVizTypeGallery
          onChange={this.changeVisType}
          selectedViz={this.state.visType}
        />
        <Button
          css={[
            cssStatic,
            css`
              align-self: flex-end;
            `,
          ]}
          buttonStyle="primary"
          disabled={this.isBtnDisabled()}
          onClick={this.gotoSlice}
        >
          {t('Create new chart')}
        </Button>
      </StyledContainer>
    );
  }
}
