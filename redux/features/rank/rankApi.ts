import { apiSlice } from '../api/apiSlice';

export const rankApi = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		// get rank
		getRank: builder.query<any, any>({
			query: () => ({
				url: '/rank',
				method: 'GET',
			}),
		}),

		// get my-rank-record
		getMyRankRecord: builder.query<any, any>({
			query: () => ({
				url: '/my-rank-record',
				method: 'GET',
			}),
		}),
	}),
});

export const { useGetRankQuery, useGetMyRankRecordQuery } = rankApi;
