import { CREATE_USER, GET_ME } from "@/lib/graphql/queries";
import { User, UserRole } from "@/types";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useUser } from "@auth0/nextjs-auth0";
import React, { createContext, useContext, useEffect, useReducer } from "react";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  isManager: boolean;
  isCareWorker: boolean;
  login: () => void;
  logout: () => void;
}

type AuthAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    user: auth0User,
    isLoading: auth0Loading,
    error: auth0Error,
  } = useUser();

  const [getMe, { data: userData, loading: userLoading }] =
    useLazyQuery(GET_ME);
  const [createUser] = useMutation(CREATE_USER);

  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (auth0Loading) {
      dispatch({ type: "SET_LOADING", payload: true });
      return;
    }

    if (auth0Error) {
      dispatch({ type: "SET_ERROR", payload: auth0Error.message });
      return;
    }

    if (auth0User) {
      getMe();
    } else {
      dispatch({ type: "SET_USER", payload: null });
    }
  }, [auth0User, auth0Loading, auth0Error, getMe]);

  useEffect(() => {
    if (userData?.me) {
      dispatch({ type: "SET_USER", payload: userData.me });
    } else if (auth0User && !userLoading && userData !== undefined) {
      const createNewUser = async () => {
        try {
          const result = await createUser({
            variables: {
              input: {
                email: auth0User.email!,
                name: auth0User.name || null,
                auth0Id: auth0User.sub!,
                role: UserRole.CARE_WORKER,
              },
            },
          });

          if (result.data?.createUser) {
            dispatch({ type: "SET_USER", payload: result.data.createUser });
          }
        } catch (error) {
          console.error("Error creating user:", error);
          dispatch({
            type: "SET_ERROR",
            payload: "Failed to create user account",
          });
        }
      };

      createNewUser();
    }
  }, [userData, auth0User, userLoading, createUser]);

  const login = () => {
    window.location.href = "/auth/login";
  };

  const logout = () => {
    window.location.href = "/auth/logout";
  };

  const value: AuthContextType = {
    ...state,
    isManager: state.user?.role === UserRole.MANAGER,
    isCareWorker: state.user?.role === UserRole.CARE_WORKER,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
