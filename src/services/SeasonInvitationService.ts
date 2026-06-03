import axiosClient from "./axiosClient";

export type InvitationStatus = "INVITED" | "ACCEPTED" | "DECLINED" | "EXPIRED";

export type SeasonInvitationResponse = {
  id: number;
  seasonId: number;
  seasonName?: string | null;
  teamId: number;
  teamName: string;
  status: InvitationStatus;
  invitedAt: string;
  responseDeadline: string;
  respondedAt?: string | null;
  responseNote?: string | null;
};

export type SeasonInvitationCreateRequest = {
  teamId: number;
  responseDeadline?: string | null;
};

class SeasonInvitationService {
  // TODO: add a club/current-user invitation listing method when the backend exposes it.
  invite(seasonId: number, payload: SeasonInvitationCreateRequest) {
    return axiosClient.post<SeasonInvitationResponse>(
      `/seasons/${seasonId}/invitations`,
      payload,
    );
  }

  getBySeason(seasonId: number) {
    return axiosClient.get<SeasonInvitationResponse[]>(
      `/seasons/${seasonId}/invitations`,
    );
  }

  accept(id: number) {
    return axiosClient.post<SeasonInvitationResponse>(
      `/invitations/${id}/accept`,
    );
  }

  decline(id: number, note?: string) {
    return axiosClient.post<SeasonInvitationResponse>(
      `/invitations/${id}/decline`,
      { note },
    );
  }
  getMyInvitations() {
    return axiosClient.get<SeasonInvitationResponse[]>("/invitations/my");
  }
}

export default new SeasonInvitationService();
